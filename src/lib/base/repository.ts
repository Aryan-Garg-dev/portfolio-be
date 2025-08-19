import mongoose, {
	type Model,
	type Document,
	type ClientSession,
	type FilterQuery,
	type UpdateQuery,
	type Types,
} from "mongoose";
import type { TLeanDoc } from "@/common/types";
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

interface IBaseDocument extends Document {
	_id: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IBaseRepository<TDoc extends IBaseDocument, TLean = TLeanDoc<TDoc>> {
	readonly model: Model<TDoc>;

	create(data: Partial<TDoc>, session?: ClientSession): Promise<TLean>;

	findById(id: string | Types.ObjectId): Promise<TLean | null>;

	findOne(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TLean | null>;

	find(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TLean[]>;

	update(id: string | Types.ObjectId, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TLean | null>;

	updateOne(filter: TRepositoryFilter<TDoc>, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TLean | null>;

	delete(id: string | Types.ObjectId, session?: ClientSession): Promise<TLean | null>;

	deleteMany(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number>;

	findPaginated(
		filter: TRepositoryFilter<TDoc>,
		options?: IPaginationOptions,
		session?: ClientSession
	): Promise<IPaginationResult<TLean>>;

	count(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<number>;

	exists(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<boolean>;

	toDTO(doc: TLean | null): Record<string, any> | null;

	transaction<K>(fn: (session: ClientSession) => Promise<K>): Promise<K>;
}

export class BaseRepository<TDoc extends IBaseDocument, TLean = TLeanDoc<TDoc>>
	implements IBaseRepository<TDoc, TLean>
{
	readonly model: Model<TDoc>;
	private readonly _maxPaginationLimit: number = 100;

	constructor(model: Model<TDoc>, maxPagination?: number) {
		this.model = model;
		if (maxPagination) this._maxPaginationLimit = maxPagination;
	}

	async create(data: Partial<TDoc>, session?: ClientSession): Promise<TLean> {
		const docs = await this.model.create([data], { session });
		const doc = docs[0];
		if (!doc) {
			throw new Error("Failed to create document");
		}
		return doc.toObject({ virtuals: false, versionKey: false }) as TLean;
	}

	async findById(id: string | Types.ObjectId): Promise<TLean | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findById(id).lean<TLean>().exec();
	}

	async findOne(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TLean | null> {
		return this.model
			.findOne(filter)
			.lean<TLean>()
			.session(session || null)
			.exec();
	}

	async find(filter: TRepositoryFilter<TDoc>, session?: ClientSession): Promise<TLean[]> {
		return this.model
			.find(filter)
			.lean<TLean[]>()
			.session(session || null)
			.exec();
	}

	async update(id: string | Types.ObjectId, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TLean | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findByIdAndUpdate(id, data, { new: true, session }).lean<TLean>().exec();
	}

	async updateOne(
		filter: TRepositoryFilter<TDoc>,
		data: UpdateQuery<TDoc>,
		session?: ClientSession
	): Promise<TLean | null> {
		return this.model.findOneAndUpdate(filter, data, { new: true, session }).lean<TLean>().exec();
	}

	async delete(id: string | Types.ObjectId, session?: ClientSession): Promise<TLean | null> {
		if (!mongoose.isValidObjectId(id)) {
			return null;
		}
		return this.model.findByIdAndDelete(id, { session }).lean<TLean>().exec();
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
	): Promise<IPaginationResult<TLean>> {
		// Validate pagination parameters
		const validatedPage = Math.max(1, Math.floor(page));
		const validatedLimit = Math.min(Math.max(1, Math.floor(limit)), this._maxPaginationLimit); // Cap at 100

		const skip = (validatedPage - 1) * validatedLimit;

		const [docs, total] = await Promise.all([
			this.model
				.find(filter)
				.skip(skip)
				.limit(validatedLimit)
				.lean<TLean[]>()
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

	toDTO(doc: TLean | null): Record<string, any> | null {
		if (!doc) return null;

		// Create a copy and remove Mongoose-specific fields
		const obj = { ...doc } as any;
		delete obj.__v;
		delete obj.$__;
		delete obj.$isNew;

		// Convert ObjectIds to strings for API responses
		if (obj._id && typeof obj._id === "object" && "toString" in obj._id) {
			obj.id = obj._id.toString();
			delete obj._id;
		}

		return obj;
	}

	async transaction<K>(fn: (session: ClientSession) => Promise<K>): Promise<K> {
		return startTransaction(fn);
	}

	async upsert(filter: TRepositoryFilter<TDoc>, data: UpdateQuery<TDoc>, session?: ClientSession): Promise<TLean> {
		const result = await this.model
			.findOneAndUpdate(filter, data, {
				new: true,
				upsert: true,
				session,
				setDefaultsOnInsert: true,
			})
			.lean<TLean>()
			.exec();

		if (!result) {
			throw new Error("Upsert operation failed unexpectedly");
		}
		return result; // upsert: true guarantees a result
	}
}

// Example usage with a specific model:
/*
interface IUser extends IBaseDocument {
  name: string;
  email: string;
  age?: number;
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
  async findByEmail(email: string): Promise<LeanDocument<IUser> | null> {
    return this.findOne({ email });
  }

  // Override toDTO for user-specific transformations
  toDTO(doc: LeanDocument<IUser> | null): Record<string, any> | null {
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
