import type * as JestFile from "@rbxts/jest";

import type * as ConfigFile from "test/jest.config";
declare global {
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
			Promise: ModuleScript;
			RuntimeLib: ModuleScript;
		} & Folder;
		TS: {
			__test__: {
				"jest.config": ModuleScript;
			} & Folder;
			centurion: {
				types: {
					username: ModuleScript;
				} & ModuleScript;
			} & Folder;
			components: {
				abstract: {
					destroyable: ModuleScript;
				} & Folder;
				interactable: {
					clickable: ModuleScript;
					proximity: ModuleScript;
					touch: ModuleScript;
				} & Folder;
			} & Folder;
			constants: {
				core: ModuleScript;
				player: ModuleScript;
			} & Folder;
			functions: {
				"game-config": ModuleScript;
				logger: ModuleScript;
			} & Folder;
			modules: {
				"3dSound": ModuleScript;
			} & Folder;
			network: {
				remotes: Folder;
			} & ModuleScript;
			store: {
				atoms: {
					player: {
						achievements: ModuleScript;
						balance: ModuleScript;
						datastore: ModuleScript;
						mtx: ModuleScript;
						settings: ModuleScript;
					} & Folder;
				} & Folder;
				sync: {
					atoms: ModuleScript;
					"filter-payload": ModuleScript;
				} & Folder;
			} & Folder;
		} & Folder;
		"TS-types": {
			enums: {
				badge: ModuleScript;
				mtx: ModuleScript;
			} & Folder;
			interfaces: Folder;
		} & Folder;
		utils: {
			charm: {
				"flatten-atoms": ModuleScript;
			} & Folder;
			"core-call": ModuleScript;
			flamework: ModuleScript;
			"no-yield": ModuleScript;
			physics: ModuleScript;
			player: ModuleScript;
		} & Folder;
	}
	interface ServerScriptService {
		TS: {
			__test__: {
				"jest.config": ModuleScript;
				"test.spec": ModuleScript;
			} & Folder;
			centurion: {
				commands: {
					moderation: {
						moderation: ModuleScript;
						"moderation.config": ModuleScript;
					} & Folder;
					"register.config": ModuleScript;
				} & Folder;
				guards: {
					"is-developer": ModuleScript;
				} & Folder;
				run: ModuleScript;
			} & Folder;
			network: ModuleScript;
			runtime: Script;
			services: {
				mtx: {
					decorators: ModuleScript;
					events: {
						"game-passes": ModuleScript;
						products: ModuleScript;
					} & Folder;
				} & ModuleScript;
				player: {
					badge: ModuleScript;
					character: ModuleScript;
					data: {
						schema: ModuleScript;
					} & ModuleScript;
					entity: ModuleScript;
					leaderstats: ModuleScript;
					removal: ModuleScript;
				} & ModuleScript;
			} & Folder;
			store: {
				sync: Script;
			} & Folder;
		} & Folder;
	}
	interface TestService {
		"jest.config": {
			/** @hidden */
			__ID__: "TEST_SERVICE/jest.config";
		} & ModuleScript;
		runtime: Script;
	}
	interface Workspace {
		Baseplate: Part;
	}
	function require(moduleScript: TestService["jest.config"]): typeof ConfigFile;
	function require(
		moduleScript: ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"]["src"],
	): typeof JestFile;
}
export {};
