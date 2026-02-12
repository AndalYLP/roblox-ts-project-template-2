import type { Argv } from "@rbxts/jest/src/config";

const TestService = game.GetService("TestService");

export = {
	ci: _G.__CI__,
	setupFiles: [TestService.setup],
	testMatch: ["**/*.spec"],
	verbose: _G.__VERBOSE__,
} satisfies Argv;
