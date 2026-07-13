/** Money granted per streak day; the streak cycles through this list. */
export const DAILY_REWARD_TABLE = [100, 150, 200, 300, 500, 750, 1000];

/** The reward amount for a given 1-based streak day. */
export function getDailyReward(streak: number): number {
	const index = (math.max(streak, 1) - 1) % DAILY_REWARD_TABLE.size();
	return DAILY_REWARD_TABLE[index];
}
