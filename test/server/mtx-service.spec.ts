import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { MtxService } from "server/services/mtx";
import { setPlayerData } from "shared/store/atoms/player/atom";
import { getPlayerMtxData, type PlayerMtxData } from "shared/store/atoms/player/mtx";
import { type GamePass, gamePass, type Product, product } from "types/enums/mtx";
import type { PlayerService } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

import {
	makeLogger,
	makePlayerData,
	makePlayerEntity,
	resetPlayerAtoms,
	type StubLogger,
} from "./support/service-stubs";

// NOTE: These tests only exercise deterministic logic. The purchase and game
// pass flows that hit MarketplaceService (ProcessReceipt, getProductInfo,
// UserOwnsGamePassAsync) need real, usable product/pass IDs and a real universe,
// so they are intentionally out of scope. IDs come from the enum values so the
// `t.literal` validators (built from the same enum) accept them in any env.

type GamePassHandler = (
	playerEntity: PlayerEntity,
	gamePassId: GamePass,
	isActive: boolean,
) => void;

/**
 * Private surface under test. Methods use shorthand syntax so roblox-ts emits
 * self-aware (`:`) calls against the real service instance.
 */
interface MtxServiceInternals {
	gamePassHandlers: Map<GamePass, Array<GamePassHandler>>;
	grantProduct(playerEntity: PlayerEntity, productId: Product, currencySpent: number): boolean;
	notifyGamePassActive(playerEntity: PlayerEntity, gamePassId: GamePass, active: boolean): void;
	purchaseIdLog: number;
	registerProductHandler(
		productId: Product,
		handler: (playerEntity: PlayerEntity, productId: Product) => boolean,
	): void;
	updateReceiptHistory(userId: string, data: PlayerMtxData, purchaseId: string): void;
}

const USER_ID = 1;
const USER = tostring(USER_ID);

describe("MtxService", () => {
	let logger: StubLogger;
	let service: MtxService;
	let internals: MtxServiceInternals;
	let entity: PlayerEntity;

	beforeEach(() => {
		resetPlayerAtoms();
		logger = makeLogger();
		service = new MtxService(logger.logger, {} as unknown as PlayerService);
		internals = service as unknown as MtxServiceInternals;
		entity = makePlayerEntity(USER_ID);
		setPlayerData(USER, makePlayerData());
	});

	describe("updateReceiptHistory", () => {
		it("caps the receipt history at purchaseIdLog entries", () => {
			const total = internals.purchaseIdLog + 10;

			for (let index = 0; index < total; index++) {
				const data = getPlayerMtxData(USER)!;
				internals.updateReceiptHistory(USER, data, `id-${index}`);
			}

			const history = getPlayerMtxData(USER)!.receiptHistory;
			expect(history.size()).toBe(internals.purchaseIdLog);
			expect(history.includes(`id-${total - 1}`)).toBe(true);
			expect(history.includes("id-0")).toBe(false);
		});
	});

	describe("grantProduct", () => {
		it("runs the registered handler and records the purchase", () => {
			let handlerCalls = 0;
			internals.registerProductHandler(product.Example, () => {
				handlerCalls += 1;
				return true;
			});

			const granted = internals.grantProduct(entity, product.Example, 100);

			expect(granted).toBe(true);
			expect(handlerCalls).toBe(1);
			expect(getPlayerMtxData(USER)?.products.get(product.Example)?.timesPurchased).toBe(1);
		});

		it("fails and logs when no handler is registered", () => {
			const granted = internals.grantProduct(entity, product.Example, 100);

			expect(granted).toBe(false);
			expect(logger.calls.Fatal).toBe(1);
		});

		it("fails and warns for an invalid product id", () => {
			const granted = internals.grantProduct(entity, "999" as Product, 100);

			expect(granted).toBe(false);
			expect(logger.calls.Warn).toBe(1);
		});
	});

	describe("notifyGamePassActive", () => {
		it("dispatches to handlers registered for the game pass", () => {
			let receivedActive: boolean | undefined;
			internals.gamePassHandlers.get(gamePass.Example)?.push((_entity, _id, isActive) => {
				receivedActive = isActive;
			});

			internals.notifyGamePassActive(entity, gamePass.Example, true);
			task.wait();

			expect(receivedActive).toBe(true);
		});
	});
});
