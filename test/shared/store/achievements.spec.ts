import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { getPlayerAchievementsData, setBadgeStatus } from "shared/store/atoms/player/achievements";
import { getPlayerData, setPlayerData } from "shared/store/atoms/player/atom";
import type { Badge } from "types/enums/badge";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

const USER = "1";
const BADGE = "1" as Badge;
const OTHER_BADGE = "2" as Badge;

describe("achievements atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
		setPlayerData(USER, makePlayerData());
	});

	it("returns undefined for a badge that was never set", () => {
		expect(getPlayerAchievementsData(USER)?.badges.get(BADGE)).toBeUndefined();
	});

	it("records a badge as earned", () => {
		setBadgeStatus(USER, BADGE, true);

		expect(getPlayerAchievementsData(USER)?.badges.get(BADGE)).toBe(true);
	});

	it("can flip a badge status", () => {
		setBadgeStatus(USER, BADGE, true);
		setBadgeStatus(USER, BADGE, false);

		expect(getPlayerAchievementsData(USER)?.badges.get(BADGE)).toBe(false);
	});

	it("preserves other badges when setting one", () => {
		setBadgeStatus(USER, BADGE, true);
		setBadgeStatus(USER, OTHER_BADGE, true);

		expect(getPlayerAchievementsData(USER)?.badges.get(BADGE)).toBe(true);
		expect(getPlayerAchievementsData(USER)?.badges.get(OTHER_BADGE)).toBe(true);
	});

	it("is a no-op for a user with no loaded data", () => {
		resetPlayerAtoms();

		setBadgeStatus(USER, BADGE, true);

		expect(getPlayerAchievementsData(USER)).toBeUndefined();
	});

	it("does not mutate unrelated data slices", () => {
		setPlayerData(USER, makePlayerData({ balance: { money: 42 } }));

		setBadgeStatus(USER, BADGE, true);

		expect(getPlayerData(USER)?.balance.money).toBe(42);
	});
});
