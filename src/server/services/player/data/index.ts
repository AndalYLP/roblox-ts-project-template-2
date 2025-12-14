import { Service } from "@flamework/core";
import { effect } from "@rbxts/charm";
import type { Collection, Document } from "@rbxts/lapis";
import { createCollection, setConfig } from "@rbxts/lapis";
import DataStoreServiceMock from "@rbxts/lapis-mockdatastore";
import type { Logger } from "@rbxts/log";
import { Players } from "@rbxts/services";
import { defaultPlayerData, validate } from "server/services/player/data/schema";
import type { PlayerRemovalService } from "server/services/player/removal";
import { IS_DEV, IS_STUDIO } from "shared/constants/core";
import {
	deletePlayerData,
	getPlayerData,
	type PlayerData,
	setPlayerData,
} from "shared/store/atoms/player/datastore";
import { KickCode } from "types/enums/kick-reason";

/**
 * Service for loading and saving player data. This service is responsible for
 * loading player data when a player joins the game, and hooking up reflex data
 * changes to the player's data document in the data store.
 */
@Service()
export class PlayerDataService {
	private readonly collection: Collection<PlayerData>;

	constructor(
		private readonly logger: Logger,
		private readonly playerRemovalService: PlayerRemovalService,
	) {
		if (IS_DEV && IS_STUDIO) {
			setConfig({
				dataStoreService: new DataStoreServiceMock(),
			});
		}

		this.collection = createCollection<PlayerData>(IS_STUDIO ? "development" : "production", {
			defaultData: defaultPlayerData,
			validate,
		});
	}

	/**
	 * Loads the player data for the given player.
	 *
	 * @param player - The player to load data for.
	 * @returns The player data document if it was loaded successfully.
	 */
	public async loadPlayerData(player: Player): Promise<Document<PlayerData> | void> {
		try {
			const playerId = tostring(player.UserId);

			const document = await this.collection.load(playerId, [player.UserId]);

			if (!player.IsDescendantOf(Players)) {
				return;
			}

			const unsubscribe = effect(() => {
				const data = getPlayerData(player.Name);

				if (data) {
					document.write(data);
				}
			});

			document.beforeClose(() => {
				unsubscribe();
				deletePlayerData(playerId);
			});

			setPlayerData(playerId, document.read());

			return document;
		} catch (err) {
			this.logger.Warn(`Failed to load data for ${player.UserId}: ${err}`);
			this.playerRemovalService.removeForBug(player, KickCode.PlayerProfileUndefined);
		}
	}
}
