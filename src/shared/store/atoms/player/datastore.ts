import { atom } from "@rbxts/charm";

import type { PlayerAchievementsData } from "shared/store/atoms/player/achievements";
import type { PlayerBalanceData } from "shared/store/atoms/player/balance";
import type { PlayerMtxData } from "shared/store/atoms/player/mtx";
import type { PlayerSettingsData } from "shared/store/atoms/player/settings";

export interface PlayerData {
	readonly achievements: PlayerAchievementsData;
	readonly balance: PlayerBalanceData;
	readonly mtx: PlayerMtxData;
	readonly settings: PlayerSettingsData;
}

type PlayerDataMap = {
	readonly [K in string]?: PlayerData;
};

export const datastore = {
	players: atom<PlayerDataMap>({}),
};

export function getPlayerData(userId: string): PlayerData | undefined {
	return datastore.players()[userId];
}

export function setPlayerData(userId: string, data: PlayerData): void {
	datastore.players((state) => ({
		...state,
		[userId]: data,
	}));
}

export function deletePlayerData(userId: string): void {
	datastore.players((state) => ({
		...state,
		[userId]: undefined,
	}));
}

export function updatePlayerData(userId: string, updater: (state: PlayerData) => PlayerData): void {
	datastore.players((state) => ({
		...state,
		[userId]: state[userId] && updater(state[userId]),
	}));
}
