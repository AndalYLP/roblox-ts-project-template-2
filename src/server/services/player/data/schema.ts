import { Flamework } from "@flamework/core"
import { PlayerData } from "shared/store/atoms/player/datastore"

export const defaultPlayerData: PlayerData = {
	balance: {
		money: 0
	},
	achievements: {
		badges: new Map()
	},
	mtx: {
		gamePasses: new Map(),
		products: new Map(),
		receiptHistory: []
	},
	settings: {
		audio: {
			musicVolume: 1,
			sfxVolume: 1
		}
	}
}

export const validate = Flamework.createGuard<PlayerData>()