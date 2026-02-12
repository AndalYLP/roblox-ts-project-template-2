import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";

export interface PlayerBalance {
	money: number;
}

export function addBalance(userId: string, amount: number): void {
	updatePlayerData(userId, (data) => {
		const { balance } = data;

		return {
			...data,
			balance: {
				...balance,
				money: balance.money + amount,
			},
		};
	});
}

export function getPlayerBalance(userId: string): PlayerBalance | undefined {
	return getPlayerData(userId)?.balance;
}
