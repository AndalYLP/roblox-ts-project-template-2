import type * as JestFile from "@rbxts/jest";

import type * as ConfigFile from "test/jest.config";

interface ReplicatedStorage {
	rbxts_include: {
		node_modules: {
			"@rbxts": {
				jest: {
					src: {
						/** @hidden */
						__ID__: "JEST/src";
					} & ModuleScript;
				} & Folder;
			} & Folder;
		} & Folder;
	} & Folder;
}

interface TestService {
	"jest.config": {
		/** @hidden */
		__ID__: "TEST_SERVICE/jest.config";
	} & ModuleScript;
}

declare function require(moduleScript: TestService["jest.config"]): typeof ConfigFile;
declare function require(
	moduleScript: ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"]["src"],
): typeof JestFile;
