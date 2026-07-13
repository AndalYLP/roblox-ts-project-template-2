import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";

export interface PlayerBalanceData {
	money: number;
}

export function addBalance(userId: string, amount: number): void {
	updatePlayerData(userId, (state) => {
		const { balance } = state;

		return {
			...state,
			balance: {
				...balance,
				money: balance.money + amount,
			},
		};
	});
}

export function getPlayerBalanceData(userId: string): PlayerBalanceData | undefined {
	return getPlayerData(userId)?.balance;
}
