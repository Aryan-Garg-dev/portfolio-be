import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { BlogStatus } from "@/modules/blog/blog.constants.ts";
import type { IBlog } from "@/modules/blog/blog.types.ts"

export interface IBlogDocument extends Document<Types.ObjectId>, Omit<IBlog, "id"> {
  _id: Types.ObjectId;
}

export const blogSchema = new Schema<IBlogDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    topics: { type: [String], default: [] },
    previewImage: { type: String, default: null },
    slug: { type: String, required: true, unique: true},
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      required: true
    },
    visits: { type: Number, default: 0 },
    reads: { type: Number, default: 0 },
    sources: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

blogSchema.index(
  { slug: 1 },
  { unique: true, background: true }
); // get blog by slug
blogSchema.index(
  { topics: 1, createdAt: -1 },
  {
    partialFilterExpression: { status: "published" },
    background: true
  }
); // get blog by topic
blogSchema.index(
  { createdAt: -1 },
  {
    partialFilterExpression: { status: "published" },
    background: true
  }
); // get all blogs
blogSchema.index(
  { title: "text", description: "text", topics: "text" },
  {
    weights: { title: 5, description: 3, topics: 2 },
    partialFilterExpression: { status: "published" },
    background: true
  }
); // search blog by title / description (text-search)

const BlogModel: Model<IBlogDocument> =
  mongoose.models.blogs || mongoose.model<IBlogDocument>("blogs", blogSchema);

export default BlogModel;
