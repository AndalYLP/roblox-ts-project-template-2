import { atom } from "@rbxts/charm";
import { PlayerAchievements } from "shared/store/atoms/player/achievements";
import type { PlayerBalance } from "shared/store/atoms/player/balance";
import { PlayerMtx } from "shared/store/atoms/player/mtx";
import { PlayerSettings } from "shared/store/atoms/player/settings";

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

export function getPlayerData(id: string) {
	return datastore.players()[id];
}

export function setPlayerData(id: string, playerData: PlayerData) {
	datastore.players((state) => ({
		...state,
		[id]: playerData,
	}));
}

export function deletePlayerData(id: string) {
	datastore.players((state) => ({
		...state,
		[id]: undefined,
	}));
}

export function updatePlayerData(id: string, updater: (data: PlayerData) => PlayerData) {
	datastore.players((state) => ({
		...state,
		[id]: state[id] && updater(state[id]),
	}));
}