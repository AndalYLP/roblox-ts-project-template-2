import { Service } from "@flamework/core";
import { subscribe } from "@rbxts/charm";
import { t } from "@rbxts/t";
import type { OnInit } from "@flamework/core";
import type { Logger } from "@rbxts/log";

import { getPlayerData, type PlayerData } from "shared/store/atoms/player/atom";
import type { OnPlayerJoin, OnPlayerLeave } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

interface LeaderstatValueTypes {
	IntValue: number;
	StringValue: string;
}

interface LeaderstatEntry<T extends keyof LeaderstatValueTypes = keyof LeaderstatValueTypes> {
	name: Leaderstats;
	playerDataKey?: NestedKeyOf<PlayerData>;
	valueType: T;
}

type Leaderstats = "Money" | "Test";

type LeaderstatValue = Instances[keyof LeaderstatValueTypes];

/**
 * A service that initializes the Roblox leaderboard stats for the game.
 *
 * This service is responsible for initializing the leaderboard stats for the
 * game. It will bind the stats to the player's leaderstats folder and update
 * the values based on the player's data.
 *
 * Usage: Add the required stats in the `onInit` method, and add the data key to
 * bind to then `Leaderstats` type. The service will automatically update the
 * values when the player's data changes.
 */
@Service()
export class LeaderstatsService implements OnInit, OnPlayerJoin, OnPlayerLeave {
	private readonly leaderstats: LeaderstatEntry[] = [];
	private readonly playerToLeaderstatsMap = new Map<Player, Folder>();
	private readonly playerToValueMap = new Map<Player, Map<string, LeaderstatValue>>();

	constructor(private readonly logger: Logger) {}

	public onInit(): void {
		this.registerStat("Money", "IntValue", "balance.money");
	}

	/**
	 * Returns a given stat object for a player. This can be used to update the
	 * leaderboard values for a given player if the stat object is not available
	 * in the reflex store.
	 *
	 * @param player - The player to get the stat object for.
	 * @param statName - The name of the stat to find.
	 * @returns The stat object if it exists.
	 */
	public getStatObject(player: Player, statName: Leaderstats): LeaderstatValue | undefined {
		const valueMap = this.playerToValueMap.get(player);
		if (!valueMap) {
			return;
		}

		const entry = this.leaderstats.find(
			(leaderstatsEntry) => leaderstatsEntry.name === statName,
		);
		if (!entry) {
			return;
		}

		return valueMap.get(entry.name);
	}

	public onPlayerJoin(playerEntity: PlayerEntity): void {
		const { name: Name, player, userId } = playerEntity;

		const leaderstats = new Instance("Folder");
		leaderstats.Name = "leaderstats";
		leaderstats.Parent = player;

		this.playerToLeaderstatsMap.set(player, leaderstats);

		this.logger.Info(`Assigning leaderboard stats to ${Name}.`);

		const playerData = getPlayerData(userId);
		const valueMap = new Map<Leaderstats, LeaderstatValue>();

		for (const entry of this.leaderstats) {
			const stat = new Instance(entry.valueType);
			stat.Name = entry.name;
			stat.Parent = leaderstats;
			valueMap.set(entry.name, stat);

			if (playerData === undefined || entry.playerDataKey === undefined) {
				stat.Value = entry.valueType === "IntValue" ? 0 : "N/A";
				continue;
			}

			stat.Value = this.getPlayerData(playerData, entry.playerDataKey);
		}

		this.subscribeToPlayerData(playerEntity, valueMap);

		this.playerToValueMap.set(player, valueMap);
	}

	public onPlayerLeave({ player }: PlayerEntity): Promise<void> | void {
		const valueMap = this.playerToValueMap.get(player);
		if (valueMap !== undefined) {
			for (const [, value] of valueMap) {
				value.Destroy();
			}
		}

		this.playerToValueMap.delete(player);

		const leaderstats = this.playerToLeaderstatsMap.get(player);
		if (leaderstats !== undefined) {
			leaderstats.Destroy();
		}

		this.playerToLeaderstatsMap.delete(player);
	}

	/**
	 * Gets the value of a key from the player's data.
	 *
	 * @param playerData - The player data object.
	 * @param nestedKey - The key to get the value of.
	 * @returns The value of the nested key.
	 */
	private getPlayerData(
		playerData: PlayerData,
		nestedKey: NestedKeyOf<PlayerData>,
	): ValueOf<LeaderstatValueTypes> {
		const keys = nestedKey.split(".");
		let value = playerData;
		for (const key of keys) {
			value = value[key as never];
		}

		assert(t.number(value) || t.string(value), `Value is not a number or string: ${value}`);

		return value;
	}

	/**
	 * Registers a new stat to the leaderboard.
	 *
	 * @param statName - The name of the stat to register.
	 * @param valueType - The type of value the stat will hold.
	 * @param playerDataKey - An optional key for persistent data that binds to
	 *   the stat.
	 */
	private registerStat(
		statName: Leaderstats,
		valueType: keyof LeaderstatValueTypes,
		playerDataKey?: NestedKeyOf<PlayerData>,
	): void {
		assert(
			this.leaderstats.find((entry) => entry.name === statName) === undefined,
			`Stat provided already exists.`,
		);

		this.leaderstats.push({
			name: statName,
			playerDataKey: playerDataKey,
			valueType: valueType,
		});

		this.logger.Info(`Registered leaderboard stat ${statName}`);
	}

	/**
	 * Subscribes to the player's data and updates the leaderstats accordingly.
	 *
	 * @param playerEntity - A reference to the player entity.
	 * @param valueMap - The map of leaderstats to update.
	 */
	private subscribeToPlayerData(
		{ janitor, userId }: PlayerEntity,
		valueMap: Map<Leaderstats, LeaderstatValue>,
	): void {
		const getData = (): PlayerData | undefined => {
			return getPlayerData(userId);
		};

		janitor.Add(
			subscribe(getData, (save) => {
				if (!save) {
					return;
				}

				for (const entry of this.leaderstats) {
					if (entry.playerDataKey === undefined) {
						continue;
					}

					const stat = valueMap.get(entry.name);
					if (!stat) {
						continue;
					}

					stat.Value = this.getPlayerData(save, entry.playerDataKey);
				}
			}),
		);
	}
}
