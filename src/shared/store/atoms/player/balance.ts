import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore"

export interface PlayerBalance {
	money: number
}

export function addBalance(id: string, amount: number) {
	updatePlayerData(id, (data) => {
		const { playerBalance } = data

		return {
			...data,
			playerBalance: {
				...playerBalance,
				money: playerBalance.money + amount
			}
		}
	})
}

export function getPlayerMoney(id: string) {
	return getPlayerData(id)?.playerBalance.money
}