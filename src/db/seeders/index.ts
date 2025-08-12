import logger from "@/lib/logger";

async function seed() {
	// Seeding functions
}

seed().catch(err => {
	logger.error("Unable to seed", err);
	process.exit(1);
});
