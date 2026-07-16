import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { playersAtom, setPlayerData } from "shared/store/atoms/player/atom";
import { playerDataKey } from "shared/store/sync/atoms";
import { getPlayerSignals } from "shared/store/sync/player-signals";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

// These cover the privacy guarantee of the sync layer: a client's signals must
// only ever resolve to that client's own data, under a key unique to them. This
// used to live in `filterPayload`; it is now enforced at the signal source.

const MINE = "1";
const THEIRS = "2";

describe("getPlayerSignals", () => {
	beforeEach(() => {
		resetPlayerAtoms();
	});

	describe("datastore", () => {
		it("exposes only the target player's own entry", () => {
			const mine = makePlayerData({ balance: { money: 1 } });
			const theirs = makePlayerData({ balance: { money: 999 } });
			setPlayerData(MINE, mine);
			setPlayerData(THEIRS, theirs);

			const datastore = getPlayerSignals(MINE)[playerDataKey(MINE)]();

			expect(datastore[MINE]).toBe(mine);
			expect(datastore[THEIRS]).toBeUndefined();
		});

		it("tracks later changes to the player's own data", () => {
			const signals = getPlayerSignals(MINE);
			expect(signals[playerDataKey(MINE)]()[MINE]).toBeUndefined();

			const mine = makePlayerData({ balance: { money: 5 } });
			setPlayerData(MINE, mine);

			expect(signals[playerDataKey(MINE)]()[MINE]).toBe(mine);
		});

		it("keeps each player's signals isolated from one another", () => {
			const mine = makePlayerData({ balance: { money: 1 } });
			const theirs = makePlayerData({ balance: { money: 999 } });
			setPlayerData(MINE, mine);
			setPlayerData(THEIRS, theirs);

			expect(getPlayerSignals(THEIRS)[playerDataKey(THEIRS)]()[THEIRS]).toBe(theirs);
			expect(getPlayerSignals(THEIRS)[playerDataKey(THEIRS)]()[MINE]).toBeUndefined();
		});
	});

	// The whole point of the per-player key: Charm Sync tracks getters globally by
	// key, so two players sharing a datastore key would collide and leak.
	describe("per-player keys", () => {
		it("gives each player a distinct datastore key", () => {
			expect(playerDataKey(MINE)).never.toBe(playerDataKey(THEIRS));
		});

		it("carries only the player's own data key, not another's", () => {
			const signals = getPlayerSignals(MINE) as Record<string, unknown>;

			expect(signals[playerDataKey(MINE)]).toBeDefined();
			expect(signals[playerDataKey(THEIRS)]).toBeUndefined();
		});
	});

	describe("chatTag", () => {
		it("is shared as-is under its global key, since tags are public data", () => {
			expect(getPlayerSignals(MINE)["playersAtom/chatTag"]).toBe(playersAtom.chatTag);
		});
	});
});
