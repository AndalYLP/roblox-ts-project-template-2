import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { DailyRewardService } from "server/services/daily-reward";
import { getDailyReward } from "shared/functions/daily-reward";
import { setPlayerData } from "shared/store/atoms/player/atom";
import { getPlayerBalanceData } from "shared/store/atoms/player/balance";
import { getPlayerDailyRewardData } from "shared/store/atoms/player/daily-reward";
import type { AnalyticsService } from "server/services/analytics";
import type { PlayerService } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

import {
	makeLogger,
	makePlayerData,
	makePlayerEntity,
	resetPlayerAtoms,
} from "./support/service-stubs";

const DAY = 24 * 60 * 60;
const USER_ID = 1;
const USER = tostring(USER_ID);

interface LoggedEvent {
	event: string;
	value?: number;
}

describe("DailyRewardService", () => {
	let service: DailyRewardService;
	let entity: PlayerEntity;
	let customEvents: Array<LoggedEvent>;

	beforeEach(() => {
		resetPlayerAtoms();
		customEvents = [];
		// Records custom events so the analytics contract is asserted, not just
		// satisfied — a stub that only keeps `claim` from erroring would let a
		// missing event slip through.
		const analytics = {
			logCurrencyGranted: () => {},
			// Method shorthand, not an arrow: the service calls this as a method, so
			// roblox-ts passes `self` first and an arrow would shift every argument.
			logCustomEvent(_player: Player, event: string, value?: number) {
				customEvents.push({ event, value });
			},
		} as unknown as AnalyticsService;
		service = new DailyRewardService(
			makeLogger().logger,
			{} as unknown as PlayerService,
			analytics,
		);
		entity = makePlayerEntity(USER_ID);
	});

	function seed(dailyReward: { lastClaimTime: number; streak: number }, money = 0): void {
		setPlayerData(USER, makePlayerData({ balance: { money }, dailyReward }));
	}

	describe("getDailyReward", () => {
		it("returns the reward for a streak day and cycles", () => {
			expect(getDailyReward(1)).toBe(100);
			expect(getDailyReward(2)).toBe(150);
			expect(getDailyReward(7)).toBe(1000);
			expect(getDailyReward(8)).toBe(100);
		});
	});

	describe("canClaim", () => {
		it("is claimable for a player who never claimed", () => {
			seed({ lastClaimTime: 0, streak: 0 });

			expect(service.canClaim(USER)).toBe(true);
		});

		it("is not claimable after claiming today", () => {
			seed({ lastClaimTime: os.time(), streak: 1 });

			expect(service.canClaim(USER)).toBe(false);
		});

		it("returns false for a user with no data", () => {
			expect(service.canClaim(USER)).toBe(false);
		});
	});

	describe("claim", () => {
		it("grants the first reward and starts the streak", () => {
			seed({ lastClaimTime: 0, streak: 0 });

			const result = service.claim(entity);

			expect(result).toEqual({ amount: 100, streak: 1 });
			expect(getPlayerBalanceData(USER)?.money).toBe(100);
			expect(getPlayerDailyRewardData(USER)?.streak).toBe(1);
		});

		it("does nothing when already claimed today", () => {
			seed({ lastClaimTime: os.time(), streak: 3 }, 50);

			const result = service.claim(entity);

			expect(result).toBeUndefined();
			expect(getPlayerBalanceData(USER)?.money).toBe(50);
			expect(customEvents.size()).toBe(0);
		});

		it("logs the claim as a custom event carrying the streak", () => {
			seed({ lastClaimTime: os.time() - DAY, streak: 3 });

			service.claim(entity);

			expect(customEvents).toEqual([{ event: "ClaimedDailyReward", value: 4 }]);
		});

		it("advances the streak on a consecutive day", () => {
			seed({ lastClaimTime: os.time() - DAY, streak: 3 });

			const result = service.claim(entity);

			expect(result).toEqual({ amount: 300, streak: 4 });
			expect(getPlayerDailyRewardData(USER)?.streak).toBe(4);
		});

		it("resets the streak after a missed day", () => {
			seed({ lastClaimTime: os.time() - 3 * DAY, streak: 5 });

			const result = service.claim(entity);

			expect(result).toEqual({ amount: 100, streak: 1 });
		});
	});
});
