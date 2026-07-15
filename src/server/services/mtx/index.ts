import { Modding, type OnInit, type OnStart, Service } from "@flamework/core";
import { MarketplaceService, Players } from "@rbxts/services";
import { Array, Dictionary } from "@rbxts/sift";
import { t } from "@rbxts/t";
import type { Logger } from "@rbxts/log";

import { events } from "server/network";
import {
	addDeveloperProductPurchase,
	getPlayerMtxData,
	type PlayerMtxData,
	setGamePassActive,
	updateReceiptHistory,
} from "shared/store/atoms/player/mtx";
import { type GamePass, gamePass, type Product, product } from "types/enums/mtx";
import { noYield } from "utils/no-yield";
import type {
	GamePassStatusChanged,
	MtxEvents,
	RegisterProductHandler,
} from "server/services/mtx/decorators";
import type { OnPlayerJoin, PlayerService } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

const NETWORK_RETRY_ATTEMPTS = 10;
const NETWORK_RETRY_DELAY = 2;

const gamePassValidator = t.union(...Dictionary.values(gamePass).map((gp) => t.literal(gp)));
const productValidator = t.union(...Dictionary.values(product).map((p) => t.literal(p)));

export * from "server/services/mtx/decorators";

/**
 * A service for managing game passes and processing receipts.
 *
 * #### Use the decorator instead of connecting to `gamePassStatusChanged` directly.
 *
 * #### Use the decorator instead of calling `RegisterProductHandler` directly.
 *
 * @example
 *
 * ```
 * ⁣@MtxEvents()
 * export class MtxEventsService {
 * 	⁣@gamePassStatusChanged()
 * 	public exampleGamePass(playerEntity: PlayerEntity, isActive: boolean) {
 * 		// Do something when the game pass is activated or deactivated
 * 	}
 *
 * 	⁣@RegisterProductHandler()
 * 	public exampleProduct(playerEntity: PlayerEntity, product: Product): boolean {
 * 		// Do something when the product is purchased
 * 		return true // Return false if there was an error processing the product
 * 	}
 * }
 *
 *
 * for (const pass of gamePasses) {
 *     if (this.mtxService.isGamePassActive(playerEntity, gamePassId)) {
 *         // Do something with the game pass owned
 *         ...
 *     }
 * }
 * ```
 */
@Service()
export class MtxService implements OnInit, OnPlayerJoin, OnStart {
	private readonly gamePassHandlers = new Map<
		GamePass,
		Array<(playerEntity: PlayerEntity, gamePassId: GamePass, isActive: boolean) => void>
	>(Dictionary.values(gamePass).map((gamePassId) => [gamePassId, []]));
	private readonly productHandlers = new Map<
		Product,
		{
			args: Array<unknown>;
			handler: (
				playerEntity: PlayerEntity,
				productId: Product,
				...args: Array<unknown>
			) => boolean;
		}
	>();
	private readonly productInfoCache = new Map<number, ProductInfo>();
	private readonly purchaseIdLog = 50;

	constructor(
		private readonly logger: Logger,
		private readonly playerService: PlayerService,
	) {}

	public onInit(): void {
		MarketplaceService.PromptGamePassPurchaseFinished.Connect(
			this.playerService.withPlayerEntity((playerEntity, gamePassId, purchased) => {
				if (!purchased) {
					return;
				}

				this.grantGamePass(playerEntity, tostring(gamePassId) as GamePass);
			}),
		);

		MarketplaceService.ProcessReceipt = (...args): Enum.ProductPurchaseDecision => {
			const [success, result] = this.processReceipt(...args).await();
			if (!success) {
				// Never let an error escape into Roblox's callback: an explicit
				// NotProcessedYet is retried predictably, a thrown error is not.
				this.logger.Error(`ProcessReceipt errored, receipt will be retried: ${result}`);
				return Enum.ProductPurchaseDecision.NotProcessedYet;
			}

			this.logger.Info(`ProcessReceipt result: ${result}`);
			return result;
		};

		void this.initRegister();
	}

	public onPlayerJoin(playerEntity: PlayerEntity): void {
		const { userId } = playerEntity;

		const gamePasses = getPlayerMtxData(userId)?.gamePasses;
		if (gamePasses === undefined) {
			return;
		}

		const unowned = Dictionary.values(gamePass).filter(
			(gamePassId) => !gamePasses.has(gamePassId),
		);
		for (const gamePassId of unowned) {
			this.checkForGamePassOwned(playerEntity, gamePassId)
				.then((owned) => {
					if (!owned) {
						return;
					}

					this.grantGamePass(playerEntity, gamePassId);
				})
				.catch((err) => {
					this.logger.Warn(`Error checking game pass ${gamePassId}: ${err}`);
				});
		}

		for (const [id, gamePassData] of gamePasses) {
			this.notifyGamePassActive(playerEntity, id, gamePassData.active);
		}
	}

	public onStart(): void {
		events.mtx.setGamePassActive.connect(
			this.playerService.withPlayerEntity((playerEntity, gamePassId, active) => {
				this.setGamePassActive(playerEntity, gamePassId, active).catch((err) => {
					this.logger.Error(
						`Failed to set game pass ${gamePassId} active for ${playerEntity.userId}: ${err}`,
					);
				});
			}),
		);
	}

	/**
	 * Retrieves the product information for a given product or game pass.
	 *
	 * @param infoType - The type of information to retrieve ("Product" or
	 *   "GamePass").
	 * @param productId - The ID of the product or game pass.
	 * @returns A Promise that resolves to the product information, or undefined
	 *   if the information is not available.
	 */
	public async getProductInfo(
		infoType: Enum.InfoType,
		productId: number,
	): Promise<ProductInfo | undefined> {
		if (this.productInfoCache.has(productId)) {
			return this.productInfoCache.get(productId);
		}

		const productInfo = await Promise.retryWithDelay(
			async () => MarketplaceService.GetProductInfo(productId, infoType) as ProductInfo,
			NETWORK_RETRY_ATTEMPTS,
			NETWORK_RETRY_DELAY,
		).catch(() => {
			this.logger.Warn(`Failed to get price for product ${productId}`);
		});

		if (productInfo === undefined) {
			return undefined;
		}

		this.productInfoCache.set(productId, productInfo);

		return productInfo;
	}

	private async checkForGamePassOwned(
		{ player, userId: UserId }: PlayerEntity,
		gamePassId: GamePass,
	): Promise<boolean> {
		if (!gamePassValidator(gamePassId)) {
			throw `Invalid game pass id ${gamePassId}`;
		}

		const owned = getPlayerMtxData(UserId)?.gamePasses.has(gamePassId);
		if (owned === true) {
			return true;
		}

		return MarketplaceService.UserOwnsGamePassAsync(player.UserId, tonumber(gamePassId)!);
	}

	private grantGamePass(playerEntity: PlayerEntity, gamePassId: GamePass): void {
		const { userId } = playerEntity;

		if (!gamePassValidator(gamePassId)) {
			this.logger.Warn(
				`Player ${userId} attempted to purchased invalid game pass ${gamePassId}`,
			);
			return;
		}

		this.logger.Info(`Player ${userId} purchased game pass ${gamePassId}`);
		setGamePassActive(userId, gamePassId, true);
		this.notifyGamePassActive(playerEntity, gamePassId, true);
	}

	private grantProduct(
		playerEntity: PlayerEntity,
		productId: Product,
		currencySpent: number,
	): boolean {
		const { userId } = playerEntity;

		if (!productValidator(productId)) {
			this.logger.Warn(
				`Player ${userId} attempted to purchased invalid product ${productId}`,
			);
			return false;
		}

		const data = this.productHandlers.get(productId);
		if (!data) {
			this.logger.Fatal(`No handler for product ${productId}`);
			return false;
		}

		const [success, result] = pcall(() =>
			noYield(data.handler, playerEntity, productId, ...data.args),
		);
		if (!success || !result) {
			this.logger.Error(`Failed to process product ${productId}`);
			return false;
		}

		this.logger.Info(`Player ${userId} purchased developer product ${productId}`);
		addDeveloperProductPurchase(userId, productId, currencySpent);
		return true;
	}

	private async initRegister(): Promise<void> {
		const mtxEvents = Modding.getDecorators<typeof MtxEvents>();

		for (const { constructor, object } of mtxEvents) {
			const singleton = Modding.resolveSingleton(constructor!) as Record<string, Callback>;

			for (const [handler, { arguments: args }] of Modding.getPropertyDecorators<
				typeof RegisterProductHandler
			>(object)) {
				for (const product of args)
					void this.loadDecorator(singleton, handler, "Product", product);
			}

			for (const [handler, { arguments: args }] of Modding.getPropertyDecorators<
				typeof GamePassStatusChanged
			>(object)) {
				for (const gamePass of args) {
					void this.loadDecorator(singleton, handler, "GamePass", gamePass);
				}
			}
		}
	}

	private async loadDecorator<T extends "GamePass" | "Product">(
		object: Record<string, Callback>,
		handler: string,
		productType: T,
		productId: T extends "Product" ? Product : GamePass,
	): Promise<void> {
		const withContextHandler = (...handlerArgs: Array<unknown>): boolean =>
			object[handler](object, ...handlerArgs) as boolean;

		if (productType === "Product") {
			this.registerProductHandler(productId as Product, withContextHandler);
		} else {
			this.gamePassHandlers.get(productId as GamePass)?.push(withContextHandler);
		}
	}

	private notifyGamePassActive(
		playerEntity: PlayerEntity,
		gamePassId: GamePass,
		active: boolean,
	): void {
		const handlers = this.gamePassHandlers.get(gamePassId);

		if (handlers) {
			for (const handler of handlers) {
				task.defer(() => {
					handler(playerEntity, gamePassId, active);
				});
			}
		}
	}

	private async processReceipt(receiptInfo: ReceiptInfo): Promise<Enum.ProductPurchaseDecision> {
		this.logger.Info(
			`Processing receipt ${receiptInfo.PurchaseId} for ${receiptInfo.PlayerId}`,
		);

		const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
		if (!player) {
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		const playerEntity = await this.playerService.getPlayerEntityAsync(player);
		if (!playerEntity) {
			// Routine: the player left before their entity existed. Roblox retries
			// the receipt later, so this is not an error.
			this.logger.Warn(
				`Player ${player.UserId} disconnected before their entity was created, receipt will be retried`,
			);
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		return this.purchaseIdCheck(playerEntity, receiptInfo);
	}

	private async purchaseIdCheck(
		playerEntity: PlayerEntity,
		{ CurrencySpent, ProductId, PurchaseId }: ReceiptInfo,
	): Promise<Enum.ProductPurchaseDecision> {
		const { document, userId } = playerEntity;

		if (document.read().mtx.receiptHistory.includes(PurchaseId)) {
			// The PurchaseId being in the in-memory document does NOT guarantee it
			// was persisted — a prior attempt may have granted in-memory but failed
			// to save. Re-save here so we only acknowledge the receipt once the grant
			// is durable; otherwise a crash would drop a paid-for purchase.
			const [success] = document.save().await();
			if (!success) {
				return Enum.ProductPurchaseDecision.NotProcessedYet;
			}

			return Enum.ProductPurchaseDecision.PurchaseGranted;
		}

		const data = getPlayerMtxData(userId);
		if (!data) {
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		if (!this.grantProduct(playerEntity, tostring(ProductId) as Product, CurrencySpent)) {
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		this.updateReceiptHistory(userId, data, PurchaseId);

		const [success] = document.save().await();
		if (!success) {
			return Enum.ProductPurchaseDecision.NotProcessedYet;
		}

		return Enum.ProductPurchaseDecision.PurchaseGranted;
	}

	private registerProductHandler(
		productId: Product,
		handler: (playerEntity: PlayerEntity, productId: Product) => boolean,
		...args: Array<unknown>
	): void {
		if (this.productHandlers.has(productId)) {
			this.logger.Error(`Handler already registered for product ${productId}`);
			return;
		}

		this.logger.Debug(`Registered handler for product ${productId}`);
		this.productHandlers.set(productId, { args, handler });
	}

	private async setGamePassActive(
		playerEntity: PlayerEntity,
		gamePassId: GamePass,
		active: boolean,
	): Promise<void> {
		await this.checkForGamePassOwned(playerEntity, gamePassId).then((owned) => {
			const { userId } = playerEntity;
			if (!owned) {
				this.logger.Warn(
					`Player ${userId} tried to activate a game pass ${gamePassId} that they do not own.`,
				);

				return;
			}

			setGamePassActive(userId, gamePassId, active);
			this.notifyGamePassActive(playerEntity, gamePassId, active);
		});
	}

	private updateReceiptHistory(userId: string, data: PlayerMtxData, purchaseId: string): void {
		const { receiptHistory } = data;

		let updatedReceiptHistory = Array.push(receiptHistory, purchaseId);
		if (updatedReceiptHistory.size() > this.purchaseIdLog) {
			updatedReceiptHistory = Array.shift(
				updatedReceiptHistory,
				updatedReceiptHistory.size() - this.purchaseIdLog,
			);
		}

		updateReceiptHistory(userId, updatedReceiptHistory);
	}
}
