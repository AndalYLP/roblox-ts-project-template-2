import type { runCLI } from "@rbxts/jest";

import type { config } from "test/jest.config";

declare global {
	interface ServerScriptService {
		TS: {
			__test__: Folder | undefined;
			centurion: {
				commands: Folder;
				guards: Folder;
				run: ModuleScript;
			} & Folder;
		} & Folder;
	}

	interface ReplicatedStorage {
		rbxts_include: {
			node_modules: {
				"@rbxts": {
					jest: {
						src: {
							Name: "JEST/SRC";
						} & ModuleScript;
					} & Folder;
					WaitForChild(
						childName: "jest",
					): ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"];
				} & Folder;
			} & Folder;
		} & Folder;
		TS: {
			__test__: Folder | undefined;
			centurion: {
				types: Folder;
			} & Folder;
		} & Folder;
		WaitForChild(childName: "rbxts_include"): ReplicatedStorage["rbxts_include"];
	}

	interface TestService {
		"jest.config": { Name: "jest.config" } & ModuleScript;
	}

	function require(moduleScript: TestService["jest.config"]): { config: typeof config };
	function require(
		moduleScript: ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"]["src"],
	): { runCLI: typeof runCLI };
}

export {};
