import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";
import type { GamePass, GamePassData, Product, ProductData } from "types/enums/mtx";

export interface PlayerMtx {
	gamePasses: Map<GamePass, GamePassData>;
	products: Map<Product, ProductData>;
	receiptHistory: Array<string>;
}

export function addDeveloperProductPurchase(
	id: string,
	product: Product,
	currencySpent: number,
): void {
	updatePlayerData(id, (data) => {
		const { mtx } = data;

		const purchaseInfo = {
			purchasePrice: currencySpent,
			purchaseTime: os.time(),
		};

		return {
			...data,
			playerMtx: {
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

export function setGamePassActive(id: string, gamePass: GamePass, active: boolean): void {
	updatePlayerData(id, (data) => {
		const { mtx } = data;

		return {
			...data,
			playerMtx: {
				...mtx,
				gamePasses: new Map([...mtx.gamePasses]).set(gamePass, { active }),
			},
		};
	});
}

export function updateReceiptHistory(id: string, receiptHistory: Array<string>): void {
	updatePlayerData(id, (data) => {
		const { mtx } = data;

		return {
			...data,
			playerMtx: {
				...mtx,
				receiptHistory: receiptHistory,
			},
		};
	});
}

export function getPlayerMtx(id: string): PlayerMtx | undefined {
	return getPlayerData(id)?.mtx;
}
