import { RunService } from "@rbxts/services";
import type { Config } from "@rbxts/jest";

import config from "test/jest.config";

export = {
	...config,
	displayName: "🔵 CLIENT",
	testPathIgnorePatterns: RunService.IsClient() ? [] : ["audio.spec"],
} satisfies Config;
