import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";
import type { Badge } from "types/enums/badge";

export interface PlayerAchievements {
	badges: Map<Badge, boolean>;
}

export function setBadgeStatus(userId: string, badge: Badge, status: boolean): void {
	updatePlayerData(userId, (data) => {
		const { achievements } = data;

		return {
			...data,
			achievements: {
				...achievements,
				badges: new Map([...achievements.badges]).set(badge, status),
			},
		};
	});
}

export function getPlayerAchievements(userId: string): PlayerAchievements | undefined {
	return getPlayerData(userId)?.achievements;
}
