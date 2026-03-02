import { Flamework } from "@flamework/core";

import type { PlayerData } from "shared/store/atoms/player/atom";

export const defaultPlayerData: PlayerData = {
	achievements: {
		badges: new Map(),
	},
	balance: {
		money: 0,
	},
	mtx: {
		gamePasses: new Map(),
		products: new Map(),
		receiptHistory: [],
	},
	settings: {
		audio: {
			musicVolume: 1,
			sfxVolume: 1,
		},
	},
};

export const validate = Flamework.createGuard<PlayerData>();
