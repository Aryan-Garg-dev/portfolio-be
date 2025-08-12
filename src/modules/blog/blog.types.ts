import type { TValueOf } from "@/common/types";
import type { BlogStatus } from "@/modules/blog/blog.constants.ts";

export interface IBlog {
  id: string,

  title: string;
  slug: string;
  description: string;
  content: string;
  domain: string;
  topics: string[];
  previewImage: string | null;
  status: TValueOf<typeof BlogStatus>;

  visits: number;
  reads: number;
  sources: Map<string, number>;

  createdAt: Date;
  updatedAt: Date;
}
