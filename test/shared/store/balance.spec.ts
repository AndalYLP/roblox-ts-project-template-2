import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { getPlayerData, setPlayerData } from "shared/store/atoms/player/atom";
import { addBalance, getPlayerBalanceData } from "shared/store/atoms/player/balance";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

const USER = "1";

describe("balance atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
	});

	it("adds a positive amount to the balance", () => {
		setPlayerData(USER, makePlayerData({ balance: { money: 100 } }));

		addBalance(USER, 25);

		expect(getPlayerBalanceData(USER)?.money).toBe(125);
	});

	it("subtracts when given a negative amount", () => {
		setPlayerData(USER, makePlayerData({ balance: { money: 100 } }));

		addBalance(USER, -30);

		expect(getPlayerBalanceData(USER)?.money).toBe(70);
	});

	it("accumulates across multiple calls", () => {
		setPlayerData(USER, makePlayerData({ balance: { money: 0 } }));

		addBalance(USER, 10);
		addBalance(USER, 5);
		addBalance(USER, 15);

		expect(getPlayerBalanceData(USER)?.money).toBe(30);
	});

	it("is a no-op for a user with no loaded data", () => {
		addBalance(USER, 100);

		expect(getPlayerBalanceData(USER)).toBeUndefined();
	});

	it("does not mutate unrelated data slices", () => {
		setPlayerData(
			USER,
			makePlayerData({
				balance: { money: 0 },
				settings: { audio: { musicVolume: 0.5, sfxVolume: 0.25 } },
			}),
		);

		addBalance(USER, 50);

		const settings = getPlayerData(USER)?.settings.audio;
		expect(settings?.musicVolume).toBe(0.5);
		expect(settings?.sfxVolume).toBe(0.25);
	});
});
