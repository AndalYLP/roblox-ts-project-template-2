import { Flamework } from "@flamework/core"
import { PlayerData } from "shared/store/atoms/player/datastore"

export const defaultPlayerData: PlayerData = {
	playerBalance: {
		money: 0
	},
	playerAchievements: {
		badges: new Map()
	},
	playerMtx: {
		gamePasses: new Map(),
		products: new Map(),
		receiptHistory: []
	},
	playerSettings: {
		audio: {
			musicVolume: 1,
			sfxVolume: 1
		}
	}
}

export const validate = Flamework.createGuard<PlayerData>()