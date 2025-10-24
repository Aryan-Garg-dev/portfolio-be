import type { TMiddleware, TSetupServer } from "@/common/types";
import type { Express } from "express";

export const setup = async (app: Express, setupSequence: Array<TSetupServer>) => {
	if (setupSequence.length === 0) return;

	const [currentSetup, ...remainingSetups] = setupSequence;

	await currentSetup?.(app, (nestedApp: Express) => {
		void setup(nestedApp, remainingSetups);
	});
};

export default setup;

export const createSetupHandler = (handler: TMiddleware): TSetupServer => {
	return (app, setup) => {
		app.use(handler);
		setup?.(app);
	};
};
