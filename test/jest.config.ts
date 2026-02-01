import type { Argv } from "@rbxts/jest/src/config";

export const config = {
	ci: _G.__CI__,
	testMatch: ["**/*.spec"],
	verbose: _G.__VERBOSE__,
} satisfies Argv;
