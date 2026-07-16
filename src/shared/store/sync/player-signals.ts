import { computed } from "@rbxts/charm";

import { getPlayerData, type PlayerData } from "shared/store/atoms/player/atom";
import { atoms, type GlobalAtoms, playerDataKey } from "shared/store/sync/atoms";

/**
 * The exact signal map a single client is registered with, and the shape
 * `getPlayerSignals` returns.
 *
 * The shared signals are pulled straight from {@link GlobalAtoms}, so adding an
 * atom to `atoms` widens this automatically — no need to touch this type. The
 * player's own `datastore` slice is carried under a per-player key
 * ({@link playerDataKey}) — a template-literal index because the concrete key
 * depends on the userId — so Charm Sync never mixes players' data.
 */
export type PlayerSignals = {
	readonly [K in `playersAtom/data-${string}`]: () => {
		readonly [userId: string]: PlayerData | undefined;
	};
} & GlobalAtoms;

/**
 * Builds the signals for one client. Privacy is enforced at the source: the
 * datastore getter is a `computed` narrowed to this player's own entry and keyed
 * uniquely to them, so every payload Charm produces for this client is already
 * scoped — no post-hoc payload filtering needed.
 *
 * @param userId - The player the signals are built for.
 * @returns The signal map to register with `server.addSignalsToClient`.
 */
export function getPlayerSignals(userId: string): PlayerSignals {
	// Spread the shared signals (chatTag, and anything added to `atoms` later) so
	// they forward automatically, then add this player's own data under their
	// unique key. Built in two steps, not one literal: mixing the concrete shared
	// keys with the template-literal data key in a single literal collapses both
	// into one `[x: string]` index and widens the value types.
	const signals = { ...atoms } as Writable<PlayerSignals>;

	signals[playerDataKey(userId)] = computed(() => ({ [userId]: getPlayerData(userId) }));

	return signals;
}
