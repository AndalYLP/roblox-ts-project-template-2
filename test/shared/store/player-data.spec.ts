import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import {
	deletePlayerData,
	getPlayerData,
	setPlayerData,
	updatePlayerData,
} from "shared/store/atoms/player/atom";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

const USER_A = "1";
const USER_B = "2";

describe("player datastore atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
	});

	it("returns undefined for a user that was never set", () => {
		expect(getPlayerData(USER_A)).toBeUndefined();
	});

	it("stores and retrieves a user's data", () => {
		const data = makePlayerData({ balance: { money: 50 } });

		setPlayerData(USER_A, data);

		expect(getPlayerData(USER_A)).toBe(data);
	});

	it("keeps each user's data isolated", () => {
		setPlayerData(USER_A, makePlayerData({ balance: { money: 10 } }));
		setPlayerData(USER_B, makePlayerData({ balance: { money: 20 } }));

		expect(getPlayerData(USER_A)?.balance.money).toBe(10);
		expect(getPlayerData(USER_B)?.balance.money).toBe(20);
	});

	it("removes a user's data on delete", () => {
		setPlayerData(USER_A, makePlayerData());

		deletePlayerData(USER_A);

		expect(getPlayerData(USER_A)).toBeUndefined();
	});

	it("deleting one user does not affect another", () => {
		setPlayerData(USER_A, makePlayerData());
		setPlayerData(USER_B, makePlayerData({ balance: { money: 99 } }));

		deletePlayerData(USER_A);

		expect(getPlayerData(USER_A)).toBeUndefined();
		expect(getPlayerData(USER_B)?.balance.money).toBe(99);
	});

	it("applies the updater function to existing data", () => {
		setPlayerData(USER_A, makePlayerData({ balance: { money: 5 } }));

		updatePlayerData(USER_A, (state) => ({
			...state,
			balance: { money: state.balance.money + 45 },
		}));

		expect(getPlayerData(USER_A)?.balance.money).toBe(50);
	});

	it("is a no-op when updating a user that does not exist", () => {
		updatePlayerData(USER_A, (state) => ({
			...state,
			balance: { money: 1000 },
		}));

		expect(getPlayerData(USER_A)).toBeUndefined();
	});

	it("produces a new data reference on update (immutability)", () => {
		const original = makePlayerData({ balance: { money: 1 } });
		setPlayerData(USER_A, original);

		updatePlayerData(USER_A, (state) => ({
			...state,
			balance: { money: state.balance.money + 1 },
		}));

		const updated = getPlayerData(USER_A);
		expect(updated).never.toBe(original);
		expect(original.balance.money).toBe(1);
	});

	it("does not touch sibling users' references on update", () => {
		const dataB = makePlayerData();
		setPlayerData(USER_A, makePlayerData());
		setPlayerData(USER_B, dataB);

		updatePlayerData(USER_A, (state) => ({
			...state,
			balance: { money: 500 },
		}));

		expect(getPlayerData(USER_B)).toBe(dataB);
	});
});
