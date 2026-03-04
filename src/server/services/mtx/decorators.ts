import { Modding } from "@flamework/core";

import type { GamePass, Product } from "types/enums/mtx";

/** @metadata flamework:implements flamework:parameters injectable */
export const MtxEvents = Modding.createMetaDecorator("Class");

/**
 * Register a method to be called when a game pass status changes.
 *
 * The method will be called with the `PlayerEntity`, and whether the game pass
 * is active.
 *
 * @example (method) (playerEntity: PlayerEntity, isActive: boolean): void
 *
 * @param gamePass - The game pass to listen for.
 */
export const GamePassStatusChanged =
	Modding.createMetaDecorator<[...gamePass: GamePass[]]>("Method");

/**
 * Registers a `method` as a handler for a specific product. The handler will be
 * called when a player purchases the developer product.
 *
 * The handler should return true if the product was successfully processed, or
 * false if there was an error. The handler will also return false if there is
 * an error processing the product.
 *
 * @example (method) (playerEntity: PlayerEntity, product: Product): boolean
 *
 * @param product - The ID of the product to register the handler for.
 * @note Handlers should be registered before the player purchases the
 *  product, and should never yield.
 */
export const RegisterProductHandler =
	Modding.createMetaDecorator<[...product: Product[]]>("Method");
