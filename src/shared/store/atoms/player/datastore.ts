import { atom } from "@rbxts/charm";

import type { PlayerAchievements } from "shared/store/atoms/player/achievements";
import type { PlayerBalance } from "shared/store/atoms/player/balance";
import type { PlayerMtx } from "shared/store/atoms/player/mtx";
import type { PlayerSettings } from "shared/store/atoms/player/settings";

export interface PlayerData {
	readonly achievements: PlayerAchievements;
	readonly balance: PlayerBalance;
	readonly mtx: PlayerMtx;
	readonly settings: PlayerSettings;
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

export function setPlayerData(userId: string, playerData: PlayerData): void {
	datastore.players((state) => ({
		...state,
		[userId]: playerData,
	}));
}

export function deletePlayerData(userId: string): void {
	datastore.players((state) => ({
		...state,
		[userId]: undefined,
	}));
}

export function updatePlayerData(userId: string, updater: (data: PlayerData) => PlayerData): void {
	datastore.players((state) => ({
		...state,
		[userId]: state[userId] && updater(state[userId]),
	}));
}
