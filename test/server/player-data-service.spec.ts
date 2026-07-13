import { describe, expect, it } from "@rbxts/jest-globals";

import { type OrderedDataEntry, PlayerDataService } from "server/services/player/data";
import type { PlayerRemovalService } from "server/services/player/removal";
import type { PlayerData } from "shared/store/atoms/player/atom";

import { makeLogger, makePlayerData } from "./support/service-stubs";

/**
 * Private surface under test. Methods use shorthand syntax so roblox-ts emits
 * self-aware (`:`) calls against the real service instance.
 */
interface PlayerDataServiceInternals {
	getPlayerData(playerData: PlayerData, nestedKey: string): number;
	orderedDataStores: Array<OrderedDataEntry>;
	registerOrderedDataStore(name: string, playerDataKey?: string): void;
}

// Constructed once at module scope: the constructor creates a Lapis collection,
// and Lapis rejects creating a collection with the same name twice — so we must
// not rebuild the service per test.
const service = new PlayerDataService(makeLogger().logger, {} as unknown as PlayerRemovalService);
void service.onInit();
const internals = service as unknown as PlayerDataServiceInternals;

describe("PlayerDataService", () => {
	describe("registerOrderedDataStore", () => {
		it("registers the default Money ordered store on init", () => {
			expect(internals.orderedDataStores.size()).toBe(1);
			expect(internals.orderedDataStores[0].name).toBe("Money");
			expect(internals.orderedDataStores[0].playerDataKey).toBe("balance.money");
		});

		it("throws when the same ordered store is registered twice", () => {
			expect(() => {
				internals.registerOrderedDataStore("Money", "balance.money");
			}).toThrow();
		});
	});

	describe("getPlayerData", () => {
		it("resolves a nested numeric key", () => {
			const data = makePlayerData({ balance: { money: 250 } });

			expect(internals.getPlayerData(data, "balance.money")).toBe(250);
		});

		it("throws when the key does not resolve to a number", () => {
			const data = makePlayerData();

			expect(() => {
				internals.getPlayerData(data, "balance");
			}).toThrow();
		});
	});
});
