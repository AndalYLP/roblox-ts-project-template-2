import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";
import { Badge } from "types/enums/badge";

export interface PlayerAchievements {
	badges: Map<Badge, boolean>
}

export function setBadgeStatus(id: string, badge: Badge, status: boolean) {
	updatePlayerData(id, (data) => {
		const { playerAchievements } = data
		
		return {
			...data,
			playerAchievements: {
				...playerAchievements,
				badges: new Map([...playerAchievements.badges]).set(badge, status)
			}
		}
	})
}

export function getPlayerBadges(id: string) {
	return getPlayerData(id)?.playerAchievements.badges
}