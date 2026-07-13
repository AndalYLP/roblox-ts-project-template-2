import { Flamework, Modding } from "@flamework/core";
import Log, { type Logger } from "@rbxts/log";

import { runCenturion } from "client/centurion/runtime";
import { PLAYER_GUI } from "client/constants/player";
import { mountApp } from "client/ui/app/mount";
import { mountLoadingScreen } from "client/ui/loading/mount";
import { FLAMEWORK_IGNITED } from "shared/constants/core";
import { setupLogger } from "shared/functions/logger";

async function run(): Promise<() => void> {
	setupLogger();

	// Show the loading screen first, then drop the ReplicatedFirst bridge cover
	// now that the Vide screen covers it.
	const finishLoading = mountLoadingScreen();
	PLAYER_GUI?.FindFirstChild("LoadingCover")?.Destroy();

	Modding.registerDependency<Logger>((ctor) => Log.ForContext(ctor));

	Flamework.addPaths("src/client/controllers");

	Log.Info("Starting Flamework...");
	Flamework.ignite();

	Log.Info("Starting Centurion...");
	runCenturion().catch((err) => {
		Log.Fatal(`Error while running centurion: ${err}`);
	});

	mountApp().catch((err) => {
		Log.Fatal(`Failed to create Vide app: ${err}`);
	});

	return finishLoading;
}

run()
	.then((finishLoading) => {
		Log.Info("Flamework ignited succesfully");
		FLAMEWORK_IGNITED.Fire();
		task.wait(5);
		finishLoading();
	})
	.catch((err) => {
		Log.Fatal(`Error while running server: ${err}`);
	});
