import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { PlayerBadgeService } from "server/services/player/badge";
import { setBadgeStatus } from "shared/store/atoms/player/achievements";
import { setPlayerData } from "shared/store/atoms/player/atom";
import { badge } from "types/enums/badge";
import type { PlayerEntity } from "server/services/player/entity";

import {
	makeLogger,
	makePlayerData,
	makePlayerEntity,
	resetPlayerAtoms,
	type StubLogger,
} from "./support/service-stubs";

// NOTE: Only the data-backed paths are tested here. Awarding a badge for real
// (giveBadge → BadgeService.GetBadgeInfoAsync / AwardBadgeAsync) and the
// UserHasBadgeAsync fallback need a real badge ID and universe, so they are out
// of scope.

const USER_ID = 1;
const USER = tostring(USER_ID);

describe("PlayerBadgeService", () => {
	let logger: StubLogger;
	let service: PlayerBadgeService;
	let entity: PlayerEntity;

	beforeEach(() => {
		resetPlayerAtoms();
		logger = makeLogger();
		service = new PlayerBadgeService(logger.logger);
		entity = makePlayerEntity(USER_ID);
		setPlayerData(USER, makePlayerData());
	});

	describe("checkIfPlayerHasBadge", () => {
		it("resolves true from stored data without hitting BadgeService", () => {
			setBadgeStatus(USER, badge.Welcome, true);

			const hasBadge = service.checkIfPlayerHasBadge(entity, badge.Welcome).expect();

			expect(hasBadge).toBe(true);
		});
	});

	describe("awardBadge", () => {
		it("short-circuits when the badge is already recorded in data", () => {
			setBadgeStatus(USER, badge.Welcome, true);

			service.awardBadge(entity, badge.Welcome).expect();

			// No giveBadge path ran, so nothing should have been logged as an error.
			expect(logger.calls.Error).toBe(0);
			expect(logger.calls.Warn).toBe(0);
		});
	});
});
