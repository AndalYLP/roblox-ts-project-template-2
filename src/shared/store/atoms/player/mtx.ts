import { getPlayerData, updatePlayerData } from "shared/store/atoms/player/datastore";
import { GamePass, GamePassData, Product, ProductData } from "types/enums/mtx";

export interface PlayerMtx {
	gamePasses: Map<GamePass, GamePassData>;
	products: Map<Product, ProductData>;
	receiptHistory: Array<string>;
}

export function addDeveloperProductPurchase(id: string, product: Product, currencySpent: number) {
	updatePlayerData(id, (data) => {
		const { playerMtx } = data

		const purchaseInfo = {
			purchasePrice: currencySpent,
			purchaseTime: os.time(),
		};

		return { 
			...data,
			playerMtx: {
				...playerMtx,
				products: new Map([...playerMtx.products]).set(product, {
					purchaseInfo: [
						...(playerMtx.products.get(product)?.purchaseInfo ?? []),
						purchaseInfo,
					],
					timesPurchased: (playerMtx.products.get(product)?.timesPurchased ?? 0) + 1
				})
			}
		}
	})
}

export function setGamePassStatus(id: string, gamePass: GamePass, status: boolean) {
	updatePlayerData(id, (data) => {
		const { playerMtx } = data
		
		return {
			...data,
			playerMtx: {
				...playerMtx,
				gamePasses: new Map([...playerMtx.gamePasses]).set(gamePass, {status})
			}
		}
	})
}

export function updateReceiptHistory(id: string, receiptHistory: Array<string>) {
	updatePlayerData(id, (data) => {
		const { playerMtx } = data
		
		return {
			...data,
			playerMtx: {
				...playerMtx,
				receiptHistory: receiptHistory
			}
		}
	})
}

export function getPlayerMtx(id: string) {
	return getPlayerData(id)?.playerMtx
}