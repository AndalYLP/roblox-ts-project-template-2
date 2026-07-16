import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { playersAtom, setPlayerData } from "shared/store/atoms/player/atom";
import { atoms } from "shared/store/sync/atoms";
import { getPlayerSignals } from "shared/store/sync/player-signals";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

// These cover the privacy guarantee of the sync layer: a client's signals must
// only ever resolve to that client's own data. This used to live in
// `filterPayload`; it is now enforced at the signal source instead.

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

			const datastore = getPlayerSignals(MINE).playersAtom.datastore();

			expect(datastore[MINE]).toBe(mine);
			expect(datastore[THEIRS]).toBeUndefined();
		});

		it("tracks later changes to the player's own data", () => {
			const signals = getPlayerSignals(MINE);
			expect(signals.playersAtom.datastore()[MINE]).toBeUndefined();

			const mine = makePlayerData({ balance: { money: 5 } });
			setPlayerData(MINE, mine);

			expect(signals.playersAtom.datastore()[MINE]).toBe(mine);
		});

		it("never exposes another player's data, even after they change", () => {
			const signals = getPlayerSignals(MINE);

			setPlayerData(THEIRS, makePlayerData({ balance: { money: 999 } }));

			expect(signals.playersAtom.datastore()[THEIRS]).toBeUndefined();
		});

		it("keeps each player's signals isolated from one another", () => {
			const mine = makePlayerData({ balance: { money: 1 } });
			const theirs = makePlayerData({ balance: { money: 999 } });
			setPlayerData(MINE, mine);
			setPlayerData(THEIRS, theirs);

			expect(getPlayerSignals(THEIRS).playersAtom.datastore()[THEIRS]).toBe(theirs);
			expect(getPlayerSignals(THEIRS).playersAtom.datastore()[MINE]).toBeUndefined();
		});
	});

	// `datastore` is the only signal that gets narrowed; everything else must be
	// forwarded untouched, so a newly added atom syncs without being repeated in
	// `getPlayerSignals`.
	describe("forwarding", () => {
		it("shares chat tags as-is, since tags are public display data", () => {
			expect(getPlayerSignals(MINE).playersAtom.chatTag).toBe(playersAtom.chatTag);
		});

		it("forwards every signal in the global atoms map", () => {
			const signals = getPlayerSignals(MINE) as Record<string, unknown>;

			for (const [key] of pairs(atoms as Record<string, unknown>)) {
				expect(signals[key as string]).toBeDefined();
			}
		});
	});
});
