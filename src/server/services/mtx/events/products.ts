import type { Logger } from "@rbxts/log";

import { MtxEvents, RegisterProductHandler } from "server/services/mtx";
import type { PlayerEntity } from "server/services/player/entity";
import { Product, product } from "types/enums/mtx";


@MtxEvents()
export class ProductEventsService {
	constructor(private readonly logger: Logger) { }

	@RegisterProductHandler(product.Example)
	public exampleProduct(playerEntity: PlayerEntity, productId: Product): boolean {
		this.logger.Debug(`Example product purchased! ${playerEntity.Name} bought ${productId}`);
		return true;
	}
}