import { atom } from "@rbxts/charm";

import type { PlayerAchievementsData } from "shared/store/atoms/player/achievements";
import type { PlayerBalanceData } from "shared/store/atoms/player/balance";
import type { PlayerChatTagData } from "shared/store/atoms/player/chat-tag";
import type { PlayerDailyRewardData } from "shared/store/atoms/player/daily-reward";
import type { PlayerMtxData } from "shared/store/atoms/player/mtx";
import type { PlayerSettingsData } from "shared/store/atoms/player/settings";

export interface PlayerData {
	readonly achievements: PlayerAchievementsData;
	readonly balance: PlayerBalanceData;
	readonly dailyReward: PlayerDailyRewardData;
	readonly mtx: PlayerMtxData;
	readonly settings: PlayerSettingsData;
}

type PlayerMap<T> = {
	readonly [K in string]?: T;
};

export const playersAtom = {
	chatTag: atom<PlayerMap<PlayerChatTagData>>({}),
	datastore: atom<PlayerMap<PlayerData>>({}),
};

export function getPlayerData(userId: string): PlayerData | undefined {
	return playersAtom.datastore()[userId];
}

export function setPlayerData(userId: string, data: PlayerData): void {
	playersAtom.datastore((state) => ({
		...state,
		[userId]: data,
	}));
}

export function deletePlayerData(userId: string): void {
	playersAtom.datastore((state) => ({
		...state,
		[userId]: undefined,
	}));
}

export function updatePlayerData(userId: string, updater: (state: PlayerData) => PlayerData): void {
	playersAtom.datastore((state) => ({
		...state,
		[userId]: state[userId] && updater(state[userId]),
	}));
}
