import mongoose, { type Model, type ClientSession, type FilterQuery, type UpdateQuery } from "mongoose";
import startTransaction from "@/lib/utils/transaction.ts";

type TRepositoryFilter<T> = FilterQuery<T>;

interface IPaginationOptions {
	page?: number;
	limit?: number;
}

interface IPaginationResult<T> {
	docs: T[];
	total: number;
	page: number;
	pages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface IBaseRepository<TDoc> {
	readonly model: Model<TDoc>;

	create(data: Partial<TDoc>, session?: ClientSession): Promise<TDoc>;

	findById(id: string): Promise<TDoc | null>;

	findOne(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TDoc | null>;

	find(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TDoc[]>;

	update(id: string, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TDoc | null>;

	updateOne(filter: TRepositoryFilter<TDoc>, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TDoc | null>;

	delete(id: string, session?: ClientSession): Promise<TDoc | null>;

	deleteMany(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number>;

	findPaginated(
		filter: TRepositoryFilter<TDoc>,
		options?: IPaginationOptions,
		session?: ClientSession
	): Promise<IPaginationResult<TDoc>>;

	count(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number>;

	exists(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<boolean>;

	upsert(filter: TRepositoryFilter<TDoc>, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TDoc>;

	transaction<K>(fn: (session: ClientSession) => Promise<K>): Promise<K>;
}

export class BaseRepository<TDoc> implements IBaseRepository<TDoc> {
	readonly model: Model<TDoc>;
	private readonly _maxPaginationLimit: number = 100;

	constructor(model: Model<TDoc>, maxPagination?: number) {
		this.model = model;
		if (maxPagination) this._maxPaginationLimit = maxPagination;
	}

	async create(data: Partial<TDoc>, session?: ClientSession): Promise<TDoc> {
		const docs = await this.model.create([data], { session });
		const doc = docs[0];
		if (!doc) {
			throw new Error("Failed to create document");
		}
		return doc.toJSON() as TDoc;
	}

	async findById(id: string): Promise<TDoc | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findById(id).lean<TDoc>().exec();
	}

	async findOne(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TDoc | null> {
		return this.model
			.findOne(filter)
			.lean<TDoc>()
			.session(session || null)
			.exec();
	}

	async find(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TDoc[]> {
		return this.model
			.find(filter)
			.lean<TDoc[]>()
			.session(session || null)
			.exec();
	}

	async update(id: string, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TDoc | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findByIdAndUpdate(id, data, { new: true, session }).lean<TDoc>().exec();
	}

	async updateOne(
		filter: TRepositoryFilter<TDoc>,
		data: UpdateQuery<TDoc>,
		session?: ClientSession
	): Promise<TDoc | null> {
		return this.model.findOneAndUpdate(filter, data, { new: true, session }).lean<TDoc>().exec();
	}

	async delete(id: string, session?: ClientSession): Promise<TDoc | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findByIdAndDelete(id, { session }).lean<TDoc>().exec();
	}

	async deleteMany(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number> {
		const result = await this.model
			.deleteMany(filter)
			.session(session || null)
			.exec();
		return result.deletedCount || 0;
	}

	async findPaginated(
		filter: TRepositoryFilter<TDoc>,
		{ page = 1, limit = 10 }: IPaginationOptions = {},
		session?: ClientSession
	): Promise<IPaginationResult<TDoc>> {
		const validatedPage = Math.max(1, Math.floor(page));
		const validatedLimit = Math.min(Math.max(1, Math.floor(limit)), this._maxPaginationLimit);

		const skip = (validatedPage - 1) * validatedLimit;

		const [docs, total] = await Promise.all([
			this.model
				.find(filter)
				.skip(skip)
				.limit(validatedLimit)
				.lean<TDoc[]>()
				.session(session || null)
				.exec(),
			this.model
				.countDocuments(filter)
				.session(session || null)
				.exec(),
		]);

		const pages = Math.ceil(total / validatedLimit);
		const hasNext = validatedPage < pages;
		const hasPrev = validatedPage > 1;

		return {
			docs,
			total,
			page: validatedPage,
			pages,
			hasNext,
			hasPrev,
		};
	}

	async count(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number> {
		return this.model
			.countDocuments(filter)
			.session(session || null)
			.exec();
	}

	async exists(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<boolean> {
		const doc = await this.model
			.findOne(filter)
			.select("_id")
			.lean()
			.session(session || null)
			.exec();
		return doc !== null;
	}

	async transaction<K>(fn: (session: ClientSession) => Promise<K>): Promise<K> {
		return startTransaction(fn);
	}

	async upsert(filter: TRepositoryFilter<TDoc>, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TDoc> {
		const result = await this.model
			.findOneAndUpdate(filter, data, {
				new: true,
				upsert: true,
				session,
				setDefaultsOnInsert: true,
			})
			.lean<TDoc>()
			.exec();

		if (!result) {
			throw new Error("Upsert operation failed unexpectedly");
		}
		return result;
	}
}

// Example usage with a specific model:
/*
interface IUser {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number }
}, { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  // Add user-specific methods here
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  // Override toDTO for user-specific transformations
  toDTO(doc: IUser | null): Record<string, any> | null {
    const dto = super.toDTO(doc);
    if (!dto) return null;

    // Remove sensitive fields or add computed fields
    return {
      ...dto,
      isAdult: dto.age ? dto.age >= 18 : false
    };
  }
}
*/
