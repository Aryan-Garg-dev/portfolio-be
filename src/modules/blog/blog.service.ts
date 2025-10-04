import type { IBlogRepository } from "@/modules/blog/blog.repository.ts";
import { Result } from "@/lib/utils/result.ts";
import type { IBlog } from "@/modules/blog/blog.types.ts";
import { tryCatch } from "@/lib/utils/error.ts";

interface IBlogService {
	searchById(id: string): Promise<Result<IBlog>>;
}

class BlogService implements IBlogService {
	private readonly blogRepository: IBlogRepository;

	constructor(blogRepository: IBlogRepository) {
		this.blogRepository = blogRepository;
	}

	async searchById(id: string): Promise<Result<IBlog>> {
		const [blog, error] = await tryCatch(this.blogRepository.findById(id));
		if (error) return Result.error(error);
		if (!blog) return Result.error(new Error("Blog not found"));
		return Result.success(blog);
	}
}

export default BlogService;
