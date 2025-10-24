import cache from "@/lib/cache";
import type { TSetupServer } from "@/common/types";
import * as process from "node:process";

const setupCache: TSetupServer = async (app, setup) => {
	const connected = await cache.connect();
	if (!connected) process.exit(1);
	setup?.(app);
};

export default setupCache;
