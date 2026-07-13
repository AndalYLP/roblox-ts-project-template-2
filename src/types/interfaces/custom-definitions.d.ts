import type * as JestFile from "@rbxts/jest";

import type * as ConfigFile from "test/jest.config";

type InstanceKeys<T> = {
	[K in keyof T]: T[K] extends Instance ? K : never;
}[keyof T];

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

interface StarterPlayerScripts {
	TS: {
		__test__: {
			/** @hidden */
			__ID__: "STARTER_PLAYER_SCRIPTS/TS/__test__";
		} & ModuleScript;
	} & Folder;
}

interface TestService {
	"jest.config": {
		/** @hidden */
		__ID__: "TEST_SERVICE/jest.config";
	} & ModuleScript;
}

interface TextChatService {
	TextChannels: {
		RBXGeneral: TextChannel;
		RBXSystem: TextChannel;
	} & Folder;
	WaitForChild<T extends InstanceKeys<TextChatService>>(childName: T): TextChatService[T];
}

declare function require(moduleScript: TestService["jest.config"]): typeof ConfigFile;
declare function require(
	moduleScript: ReplicatedStorage["rbxts_include"]["node_modules"]["@rbxts"]["jest"]["src"],
): typeof JestFile;
