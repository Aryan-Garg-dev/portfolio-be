import { betterAuth } from "better-auth";
import { connectDB } from "@/lib/setup/db.ts";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const db = await connectDB();

export const auth = betterAuth({
	database: mongodbAdapter(db.connection.getClient().db()),
});
