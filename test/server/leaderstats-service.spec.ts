import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { type LeaderstatEntry, LeaderstatsService } from "server/services/player/leaderstats";
import type { PlayerData } from "shared/store/atoms/player/atom";

import { makeLogger, makePlayerData, type StubLogger } from "./support/service-stubs";

/**
 * Private surface under test. Methods use shorthand syntax so roblox-ts emits
 * self-aware (`:`) calls against the real service instance.
 */
interface LeaderstatsServiceInternals {
	getPlayerData(playerData: PlayerData, nestedKey: string): number | string;
	leaderstats: Array<LeaderstatEntry>;
	registerStat(name: string, valueType: string, playerDataKey?: string): void;
}

describe("LeaderstatsService", () => {
	let logger: StubLogger;
	let service: LeaderstatsService;
	let internals: LeaderstatsServiceInternals;

	beforeEach(() => {
		logger = makeLogger();
		service = new LeaderstatsService(logger.logger);
		internals = service as unknown as LeaderstatsServiceInternals;
	});

	describe("registerStat", () => {
		it("registers the default Money stat on init", () => {
			service.onInit();

			expect(internals.leaderstats.size()).toBe(1);
			expect(internals.leaderstats[0].name).toBe("Money");
			expect(internals.leaderstats[0].valueType).toBe("IntValue");
			expect(internals.leaderstats[0].playerDataKey).toBe("balance.money");
		});

		it("throws when the same stat is registered twice", () => {
			service.onInit();

			expect(() => {
				internals.registerStat("Money", "IntValue");
			}).toThrow();
		});
	});

	describe("getPlayerData", () => {
		it("resolves a nested numeric key", () => {
			const data = makePlayerData({ balance: { money: 123 } });

			expect(internals.getPlayerData(data, "balance.money")).toBe(123);
		});

		it("throws when the key resolves to a non-primitive value", () => {
			const data = makePlayerData();

			// "balance" points at a table, not a number or string.
			expect(() => {
				internals.getPlayerData(data, "balance");
			}).toThrow();
		});
	});
});
