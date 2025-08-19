import { BaseRepository, type IBaseRepository } from "@/lib/base/repository.ts";
import BlogModel, { type IBlogDocument } from "@/modules/blog/blog.model.ts";

export interface IBlogRepository extends IBaseRepository<IBlogDocument> {}

class BlogRepository extends BaseRepository<IBlogDocument> implements IBlogRepository {
	constructor() {
		super(BlogModel);
	}
}

export default BlogRepository;
