import { Flamework, Modding } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";
import { FLAMEWORK_IGNITED } from "shared/constants/core";
import { setupLogger } from "shared/functions/logger";

async function run(): Promise<void> {
	setupLogger();

	Modding.registerDependency<Logger>(ctor => Log.ForContext(ctor));

	Flamework.addPaths("src/server/services");

	Log.Info("Starting Flamework...");
	Flamework.ignite()
}

run()
	.then(() => {
	FLAMEWORK_IGNITED.Fire();
	})
	.catch((err) => {
	Log.Fatal(`Error while running server: ${err}`);
	});