import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";
import { Badge } from "types/enums/badge";

export interface PlayerAchievements {
	badges: Map<Badge, boolean>
}

export function setBadgeStatus(id: string, badge: Badge, status: boolean) {
	updatePlayerData(id, (data) => {
		const { achievements } = data
		
		return {
			...data,
			playerAchievements: {
				...achievements,
				badges: new Map([...achievements.badges]).set(badge, status)
			}
		}
	})
}

export function getPlayerAchievements(id: string) {
	return getPlayerData(id)?.achievements
}