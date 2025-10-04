import mongoose, { Schema, type Model } from "mongoose";
import { BlogStatus } from "@/modules/blog/blog.constants.ts";
import type { IBlog } from "@/modules/blog/blog.types.ts";

export const blogSchema = new Schema<IBlog>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		content: { type: String, required: true },
		topics: { type: [String], default: [] },
		previewImage: { type: String, default: null },
		slug: { type: String, required: true, unique: true }, // INDEX
		status: {
			type: String,
			enum: Object.values(BlogStatus),
			required: true,
		},
		visits: { type: Number, default: 0 }, //TODO: should be in key value cache store (out of db)
		reads: { type: Number, default: 0 }, //TODO: should be in key value cache store
		sources: { type: Map, of: Number, default: {} },
	},
	{ timestamps: true }
);

// INDEXES
blogSchema.index(
	{ topics: 1, createdAt: -1 },
	{
		partialFilterExpression: { status: "published" },
	}
); // get blog by topic
blogSchema.index(
	{ createdAt: -1 },
	{
		partialFilterExpression: { status: "published" },
	}
); // get all blogs
blogSchema.index(
	{ title: "text", description: "text", topics: "text" },
	{
		weights: { title: 5, description: 3, topics: 2 },
		partialFilterExpression: { status: "published" },
	}
); // search blog by title / description (text-search)

const BlogModel: Model<IBlog> = mongoose.models.blogs || mongoose.model<IBlog>("blogs", blogSchema);

export default BlogModel;
