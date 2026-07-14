import { type PlayerData, playersAtom } from "shared/store/atoms/player/atom";

/**
 * Builds a fresh {@link PlayerData} object for use in tests. Pass `overrides` to
 * tweak individual top-level slices without repeating the whole shape.
 *
 * Every call returns brand new `Map`s and tables so tests can mutate results
 * without leaking state into one another.
 */
export function makePlayerData(overrides?: Partial<PlayerData>): PlayerData {
	return {
		achievements: {
			badges: new Map(),
		},
		balance: {
			money: 0,
		},
		dailyReward: {
			lastClaimTime: 0,
			streak: 0,
		},
		mtx: {
			gamePasses: new Map(),
			products: new Map(),
			receiptHistory: [],
		},
		settings: {
			audio: {
				musicVolume: 1,
				sfxVolume: 1,
			},
			display: {
				theme: "dark",
			},
		},
		...overrides,
	};
}

/**
 * Clears every player atom back to an empty state. Call inside `beforeEach` so
 * each test starts from a clean, isolated store.
 */
export function resetPlayerAtoms(): void {
	playersAtom.datastore({});
	playersAtom.chatTag({});
}
