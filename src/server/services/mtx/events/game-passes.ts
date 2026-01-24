import type { Logger } from "@rbxts/log";
import { gamePass } from "types/enums/mtx";

import { GamePassStatusChanged, MtxEvents } from "server/services/mtx";
import type { PlayerEntity } from "server/services/player/entity";

@MtxEvents()
export class GamePassEventsService {
	constructor(private readonly logger: Logger) {}

	@GamePassStatusChanged(gamePass.Example)
	public exampleGamePass(playerEntity: PlayerEntity, isActive: boolean): void {
		if (isActive) {
			this.logger.Debug(`${playerEntity.Name} has activated example game pass!`);
		}
	}
}
