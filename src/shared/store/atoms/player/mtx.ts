import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/atom";
import type { GamePass, GamePassData, Product, ProductData } from "types/enums/mtx";

export interface PlayerMtxData {
	gamePasses: Map<GamePass, GamePassData>;
	products: Map<Product, ProductData>;
	receiptHistory: Array<string>;
}

export function addDeveloperProductPurchase(
	userId: string,
	product: Product,
	currencySpent: number,
): void {
	updatePlayerData(userId, (data) => {
		const { mtx } = data;

		const purchaseInfo = {
			purchasePrice: currencySpent,
			purchaseTime: os.time(),
		};

		return {
			...data,
			mtx: {
				...mtx,
				products: new Map([...mtx.products]).set(product, {
					purchaseInfo: [
						...(mtx.products.get(product)?.purchaseInfo ?? []),
						purchaseInfo,
					],
					timesPurchased: (mtx.products.get(product)?.timesPurchased ?? 0) + 1,
				}),
			},
		};
	});
}

export function setGamePassActive(userId: string, gamePass: GamePass, active: boolean): void {
	updatePlayerData(userId, (data) => {
		const { mtx } = data;

		return {
			...data,
			mtx: {
				...mtx,
				gamePasses: new Map([...mtx.gamePasses]).set(gamePass, { active }),
			},
		};
	});
}

export function getGamePassActive(userId: string, gamePass: GamePass): boolean | undefined {
	return getPlayerMtx(userId)?.gamePasses.get(gamePass)?.active;
}

export function updateReceiptHistory(userId: string, receiptHistory: Array<string>): void {
	updatePlayerData(userId, (data) => {
		const { mtx } = data;

		return {
			...data,
			mtx: {
				...mtx,
				receiptHistory: receiptHistory,
			},
		};
	});
}

export function getPlayerMtx(userId: string): PlayerMtxData | undefined {
	return getPlayerData(userId)?.mtx;
}
