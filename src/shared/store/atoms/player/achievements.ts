import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";
import type { Badge } from "types/enums/badge";

export interface PlayerAchievementsData {
	badges: Map<Badge, boolean>;
}

export function setBadgeStatus(userId: string, badge: Badge, status: boolean): void {
	updatePlayerData(userId, (state) => {
		const { achievements } = state;

		return {
			...state,
			achievements: {
				...achievements,
				badges: new Map([...achievements.badges]).set(badge, status),
			},
		};
	});
}

export function getPlayerAchievements(userId: string): PlayerAchievementsData | undefined {
	return getPlayerData(userId)?.achievements;
}
