import { BaseRepository, type IBaseRepository } from "@/lib/base/repository.ts";
import BlogModel from "@/modules/blog/blog.model.ts";
import type { IBlog } from "@/modules/blog/blog.types.ts";

export interface IBlogRepository extends IBaseRepository<IBlog> {}

class BlogRepository extends BaseRepository<IBlog> implements IBlogRepository {
	constructor() {
		super(BlogModel);
	}
}

export default BlogRepository;
