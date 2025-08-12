import mongoose from "mongoose";
import env from "@/config/env.ts";
import logger from "@/lib/logger";

const connectDB = async (): Promise<void> => {
	try {
		logger.info("Connecting to DB...");
		const connection = await mongoose.connect(env.DB_URL);
		logger.info(`Successfully connected to database`);
		logger.info(`DB-NAME: ${connection.connection.name}`);
	} catch (error) {
		logger.error("Error connecting to the database:", error);
		process.exit(1);
	}
};

export default connectDB;
