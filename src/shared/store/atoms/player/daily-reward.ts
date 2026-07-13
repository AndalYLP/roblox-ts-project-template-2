import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";

export interface PlayerDailyRewardData {
	/** `os.time()` of the last successful claim, or `0` if never claimed. */
	lastClaimTime: number;
	/** Current consecutive-day streak (`0` before the first claim). */
	streak: number;
}

export function getPlayerDailyRewardData(userId: string): PlayerDailyRewardData | undefined {
	return getPlayerData(userId)?.dailyReward;
}

export function recordDailyRewardClaim(userId: string, claimTime: number, streak: number): void {
	updatePlayerData(userId, (state) => ({
		...state,
		dailyReward: {
			lastClaimTime: claimTime,
			streak,
		},
	}));
}
