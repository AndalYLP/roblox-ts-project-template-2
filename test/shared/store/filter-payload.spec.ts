import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import type { SyncPayload } from "@rbxts/charm-sync";

import { type PlayerData } from "shared/store/atoms/player/atom";
import { filterPayload } from "shared/store/sync/filter-payload";
import type { GlobalAtoms } from "shared/store/sync/atoms";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

/** Casts a plain table into a Player stub — `filterPayload` only reads `UserId`. */
function fakePlayer(userId: number): Player {
	return { UserId: userId } as unknown as Player;
}

/** Reads the datastore slice out of a filtered payload for assertions. */
function datastoreOf(
	payload: SyncPayload<GlobalAtoms>,
): Record<string, PlayerData | undefined> | undefined {
	return (payload.data as Record<string, Record<string, PlayerData | undefined> | undefined>)[
		"playersAtom/datastore"
	];
}

describe("filterPayload", () => {
	beforeEach(() => {
		resetPlayerAtoms();
	});

	it("keeps only the target player's entry in an init payload", () => {
		const mine = makePlayerData({ balance: { money: 1 } });
		const theirs = makePlayerData({ balance: { money: 999 } });

		const payload = {
			data: {
				"playersAtom/chatTag": {},
				"playersAtom/datastore": { "1": mine, "2": theirs },
			},
			type: "init",
		} as unknown as SyncPayload<GlobalAtoms>;

		const filtered = filterPayload(fakePlayer(1), payload);
		const datastore = datastoreOf(filtered)!;

		expect(datastore["1"]).toBe(mine);
		expect(datastore["2"]).toBeUndefined();
	});

	it("keeps unrelated atoms untouched", () => {
		const chatTag = { "2": { tag: "VIP" } };

		const payload = {
			data: {
				"playersAtom/chatTag": chatTag,
				"playersAtom/datastore": { "1": makePlayerData() },
			},
			type: "init",
		} as unknown as SyncPayload<GlobalAtoms>;

		const filtered = filterPayload(fakePlayer(1), payload);
		const data = filtered.data as Record<string, unknown>;

		expect(data["playersAtom/chatTag"]).toBe(chatTag);
	});

	it("filters the target player's entry in a patch payload", () => {
		const mine = makePlayerData({ balance: { money: 42 } });

		const payload = {
			data: {
				"playersAtom/datastore": { "1": mine, "2": makePlayerData() },
			},
			type: "patch",
		} as unknown as SyncPayload<GlobalAtoms>;

		const filtered = filterPayload(fakePlayer(1), payload);
		const datastore = datastoreOf(filtered)!;

		expect(datastore["1"]).toBe(mine);
		expect(datastore["2"]).toBeUndefined();
	});

	it("leaves an absent datastore slice absent in a patch payload", () => {
		const payload = {
			data: {},
			type: "patch",
		} as unknown as SyncPayload<GlobalAtoms>;

		const filtered = filterPayload(fakePlayer(1), payload);

		expect(datastoreOf(filtered)).toBeUndefined();
	});
});
