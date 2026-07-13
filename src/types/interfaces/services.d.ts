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
				store: {
					"balance.spec": ModuleScript;
					"filter-payload.spec": ModuleScript;
					"mtx.spec": ModuleScript;
					"player-data.spec": ModuleScript;
					"settings.spec": ModuleScript;
				} & Folder;
				support: {
					"make-player-data": ModuleScript;
				} & Folder;
				utils: {
					"flatten-atoms.spec": ModuleScript;
				} & Folder;
			} & Folder;
			centurion: {
				types: {
					"user-id": ModuleScript;
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
						atom: ModuleScript;
						balance: ModuleScript;
						"chat-tag": ModuleScript;
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
				"character-service.spec": ModuleScript;
				"jest.config": ModuleScript;
				"leaderstats-service.spec": ModuleScript;
				"mtx-service.spec": ModuleScript;
				"player-badge-service.spec": ModuleScript;
				"player-data-service.spec": ModuleScript;
				"player-service.spec": ModuleScript;
				support: {
					"service-stubs": ModuleScript;
				} & Folder;
				"text-channel-service.spec": ModuleScript;
				"throttle.spec": ModuleScript;
			} & Folder;
			centurion: {
				commands: {
					moderation: {
						"moderation.config": ModuleScript;
					} & ModuleScript;
					"register.config": ModuleScript;
				} & Folder;
				guards: {
					"is-developer": ModuleScript;
				} & Folder;
				runtime: ModuleScript;
			} & Folder;
			network: {
				middleware: {
					throttle: ModuleScript;
				} & Folder;
			} & ModuleScript;
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
				"text-channel": ModuleScript;
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
		setup: ModuleScript;
	}
	interface TextChatService {
		ChannelTabsConfiguration: ChannelTabsConfiguration;
		TextChannels: {
			RBXGeneral: TextChannel;
			RBXSystem: TextChannel;
		} & Folder;
		WaitForChild<T extends InstanceKeys<TextChatService>>(childName: T): TextChatService[T];
	}
	interface Workspace {
		Baseplate: Part;
	}
	interface StarterPlayerScripts {
		TS: {
			__test__: {
				/** @hidden */
				__ID__: "STARTER_PLAYER_SCRIPTS/TS/__test__";
			} & ModuleScript;
		} & Folder;
	}
	type InstanceKeys<T> = {
		[K in keyof T]: T[K] extends Instance ? K : never;
	}[keyof T];
	function require(moduleScript: TestService["jest.config"]): typeof ConfigFile;
	function require(
		moduleScript: ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"]["src"],
	): typeof JestFile;
}
export {};
