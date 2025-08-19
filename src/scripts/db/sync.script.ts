import connectDB from "@/lib/setup/db.ts";
import logger from "@/lib/logger/index.ts";
import type { Mongoose } from "mongoose";
import { tryCatch } from "@/lib/utils/error.ts";

const syncIndexes = async (dbConnInstance: Mongoose) => {
	const [_, error] = await tryCatch(dbConnInstance.syncIndexes());
	if (error) {
		logger.error("Error syncing indexes:", error);
		throw error;
	} else {
		logger.info("Indexes synced successfully");
	}
};

async function syncDB() {
	const dbConnInstance = await connectDB();

	try {
		await syncIndexes(dbConnInstance);
		logger.info("Database sync completed successfully");
	} catch (error) {
		logger.error("Database sync failed:", error);
		process.exit(1);
	} finally {
		await dbConnInstance.connection.close();
		logger.info("Database connection closed");
	}

	process.exit(0);
}

await syncDB();
