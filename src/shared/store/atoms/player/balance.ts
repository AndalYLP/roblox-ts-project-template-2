import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore"

export interface PlayerBalance {
	money: number
}

export function addBalance(id: string, amount: number) {
	updatePlayerData(id, (data) => {
		const { balance } = data

		return {
			...data,
			playerBalance: {
				...balance,
				money: balance.money + amount
			}
		}
	})
}

export function getPlayerMoney(id: string) {
	return getPlayerData(id)?.balance.money
}