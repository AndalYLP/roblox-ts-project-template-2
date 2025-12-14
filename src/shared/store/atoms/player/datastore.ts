import { atom } from "@rbxts/charm";
import type { PlayerAchievements } from "shared/store/atoms/player/achievements";
import type { PlayerBalance } from "shared/store/atoms/player/balance";
import type { PlayerMtx } from "shared/store/atoms/player/mtx";
import type { PlayerSettings } from "shared/store/atoms/player/settings";

export interface PlayerData {
	readonly balance: PlayerBalance;
	readonly achievements: PlayerAchievements;
	readonly mtx: PlayerMtx;
	readonly settings: PlayerSettings;
}

type PlayerDataMap = {
	readonly [K in string]?: PlayerData;
};

export const datastore = {
	players: atom<PlayerDataMap>({}),
};

export function getPlayerData(id: string): PlayerData | undefined {
	return datastore.players()[id];
}

export function setPlayerData(id: string, playerData: PlayerData): void {
	datastore.players((state) => ({
		...state,
		[id]: playerData,
	}));
}

export function deletePlayerData(id: string): void {
	datastore.players((state) => ({
		...state,
		[id]: undefined,
	}));
}

export function updatePlayerData(id: string, updater: (data: PlayerData) => PlayerData): void {
	datastore.players((state) => ({
		...state,
		[id]: state[id] && updater(state[id]),
	}));
}
