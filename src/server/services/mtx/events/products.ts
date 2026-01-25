import type { Logger } from "@rbxts/log";

import { MtxEvents, RegisterProductHandler } from "server/services/mtx";
import { type Product, product } from "types/enums/mtx";
import type { PlayerEntity } from "server/services/player/entity";

@MtxEvents()
export class ProductEventsService {
	constructor(private readonly logger: Logger) {}

	@RegisterProductHandler(product.Example)
	public exampleProduct(playerEntity: PlayerEntity, productId: Product): boolean {
		this.logger.Debug(`Example product purchased! ${playerEntity.name} bought ${productId}`);
		return true;
	}
}
