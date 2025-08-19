import mongoose from "mongoose";
import env from "@/config/env.ts";
import logger from "@/lib/logger";

const connectDB = async () => {
	try {
		logger.info("Connecting to DB...");
		mongoose.set("autoIndex", env.NODE_ENV !== "production");
		const dbInstance = await mongoose.connect(env.DB_URL);
		logger.info(`Successfully connected to database`);
		logger.info(`DB-NAME: ${dbInstance.connection.name}`);
		return dbInstance;
	} catch (error) {
		logger.error("Error connecting to the database:", error);
		process.exit(1);
	}
};

export default connectDB;
