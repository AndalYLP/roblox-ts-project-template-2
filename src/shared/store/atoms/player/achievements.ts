import type { Badge } from "types/enums/badge";

import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";

export interface PlayerAchievements {
	badges: Map<Badge, boolean>;
}

export function setBadgeStatus(id: string, badge: Badge, status: boolean): void {
	updatePlayerData(id, (data) => {
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

export function getPlayerAchievements(id: string): PlayerAchievements | undefined {
	return getPlayerData(id)?.achievements;
}
