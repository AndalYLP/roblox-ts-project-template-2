import { Service } from "@flamework/core";
import { effect } from "@rbxts/charm";
import { createCollection, setConfig } from "@rbxts/lapis";
import DataStoreServiceMock from "@rbxts/lapis-mockdatastore";
import { DataStoreService, Players } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { t } from "@rbxts/t";
import type { OnInit } from "@flamework/core";
import type { Collection, Document } from "@rbxts/lapis";
import type { Logger } from "@rbxts/log";

import { defaultPlayerData, validate } from "server/services/player/data/schema";
import { IS_DEV, IS_STUDIO } from "shared/constants/core";
import {
	deletePlayerData,
	getPlayerData,
	type PlayerData,
	setPlayerData,
} from "shared/store/atoms/player/atom";
import { KickCode } from "types/enums/kick-reason";
import type { OnPlayerJoin, OnPlayerLeave } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";
import type { PlayerRemovalService } from "server/services/player/removal";

export interface OrderedDataEntry {
	name: OrderedData;
	playerDataKey?: NestedKeyOf<PlayerData>;
}

interface OrderedDataConfig {
	ascending?: boolean;
	maxValue?: number;
	minValue?: number;
	pageSize?: number;
}

type OrderedData = "Money" | "Test";

const ORDERED_DATA_UPDATE_TIME = 3 * 60;

/**
 * Service for loading and saving player data. This service is responsible for
 * loading player data when a player joins the game, and hooking up reflex data
 * changes to the player's data document in the data store.
 */
@Service()
export class PlayerDataService implements OnInit, OnPlayerJoin, OnPlayerLeave {
	private readonly collection: Collection<PlayerData>;
	private readonly dataStoreName = IS_STUDIO ? "development" : "production";
	private readonly orderedDataStores: Array<OrderedDataEntry> = [];

	constructor(
		private readonly logger: Logger,
		private readonly playerRemovalService: PlayerRemovalService,
	) {
		if (IS_DEV && IS_STUDIO) {
			setConfig({
				dataStoreService: new DataStoreServiceMock(),
			});
		}

		this.collection = createCollection<PlayerData>(this.dataStoreName, {
			defaultData: defaultPlayerData,
			validate,
		});
	}
	public onInit(): Promise<void> | void {
		this.registerOrderedDataStore("Money", "balance.money");
	}

	public onPlayerJoin(playerEntity: PlayerEntity): void {
		playerEntity.janitor.Add(
			setInterval(() => {
				this.savePlayerOrderedData(playerEntity);
			}, ORDERED_DATA_UPDATE_TIME),
		);
	}

	public onPlayerLeave(playerEntity: PlayerEntity): Promise<void> | void {
		this.savePlayerOrderedData(playerEntity);
	}

	public getPlayerOrderedData(
		orderedDatastore: OrderedData,
		{ ascending = false, maxValue, minValue, pageSize = 100 }: OrderedDataConfig,
	): DataStorePages {
		return DataStoreService.GetOrderedDataStore(
			this.dataStoreName,
			orderedDatastore,
		).GetSortedAsync(ascending, pageSize, minValue, maxValue);
	}

	/**
	 * Loads the player data for the given player.
	 *
	 * @param player - The player to load data for.
	 * @returns The player data document if it was loaded successfully.
	 */
	public async loadPlayerData(player: Player): Promise<Document<PlayerData> | void> {
		try {
			const userId = tostring(player.UserId);

			const document = await this.collection.load(userId, [player.UserId]);

			if (!player.IsDescendantOf(Players)) {
				return;
			}

			const unsubscribe = effect(() => {
				const data = getPlayerData(userId);

				if (data) {
					document.write(data);
				}
			});

			document.beforeClose(() => {
				unsubscribe();
				deletePlayerData(userId);
			});

			setPlayerData(userId, document.read());

			return document;
		} catch (err) {
			this.logger.Warn(`Failed to load data for ${player.UserId}: ${err}`);
			this.playerRemovalService.removeForBug(player, KickCode.PlayerProfileUndefined);
		}
	}

	private getPlayerData(playerData: PlayerData, nestedKey: NestedKeyOf<PlayerData>): number {
		const keys = nestedKey.split(".");
		let value = playerData;
		for (const key of keys) {
			value = value[key as never];
		}

		assert(t.number(value), `Value is not a number: ${value}`);

		return value;
	}

	private registerOrderedDataStore(
		dataStoreName: OrderedData,
		playerDataKey?: NestedKeyOf<PlayerData>,
	): void {
		assert(
			this.orderedDataStores.find((entry) => entry.name === dataStoreName) === undefined,
			`Datastore provided already exists.`,
		);

		this.orderedDataStores.push({
			name: dataStoreName,
			playerDataKey: playerDataKey,
		});

		this.logger.Info(`Registered ordered data ${dataStoreName}`);
	}

	private savePlayerOrderedData({ userId }: PlayerEntity): void {
		const playerData = getPlayerData(userId);
		if (!playerData) {
			return;
		}

		for (const entry of this.orderedDataStores) {
			if (entry.playerDataKey === undefined) {
				continue;
			}

			try {
				DataStoreService.GetOrderedDataStore(this.dataStoreName, entry.name).SetAsync(
					userId,
					this.getPlayerData(playerData, entry.playerDataKey),
				);
			} catch (err) {
				this.logger.Warn(`Failed to save ordered data ${entry.name} for ${userId}: ${err}`);
			}
		}
	}
}
