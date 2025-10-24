import mongoose from "mongoose";
import env from "@/config/env.ts";
import logger from "@/lib/logger";
import mongoSanitize from "express-mongo-sanitize";
import type { TSetupServer } from "@/common/types";

let dbInstance: mongoose.Mongoose | undefined;

export const connectDB = async (): Promise<mongoose.Mongoose> => {
	if (dbInstance) return dbInstance;
	try {
		logger.info("Connecting to DB...");
		mongoose.set("autoIndex", env.NODE_ENV !== "production");
		dbInstance = await mongoose.connect(env.DB_URL);
		logger.info(`Successfully connected to database`);
		logger.info(`DB-NAME: ${dbInstance.connection.name}`);
		return dbInstance;
	} catch (error) {
		logger.error("Error connecting to the database:", error);
		process.exit(1);
	}
};

const setupDB: TSetupServer = async (app, setup) => {
	await connectDB();
	app.use(mongoSanitize());
	setup?.(app);
};

export default setupDB;
