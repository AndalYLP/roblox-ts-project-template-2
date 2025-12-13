import { Flamework, Modding } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";
import { runCenturion } from "client/centurion/run";
import { FLAMEWORK_IGNITED } from "shared/constants/core";
import { setupLogger } from "shared/functions/logger";

async function run(): Promise<void> {
	setupLogger()

	Modding.registerDependency<Logger>(ctor => Log.ForContext(ctor))

	Flamework.addPaths("src/client/controllers");

	Log.Info("Starting Flamework...");
	Flamework.ignite();

	Log.Info("Starting Centurion...");
	runCenturion().catch(err => {
		Log.Fatal(`Error while running centurion: ${err}`);
	});
}

run().
	then(() => {
		Log.Info("Flamework ignited succesfully")
		FLAMEWORK_IGNITED.Fire();
	})