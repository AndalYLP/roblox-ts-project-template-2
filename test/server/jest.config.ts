import type { Config } from "@rbxts/jest";

import config from "test/jest.config";

export default {
	...config,
	displayName: "🟢 SERVER",
} satisfies Config;
