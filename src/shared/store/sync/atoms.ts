import { playersAtom } from "shared/store/atoms/player/atom";
import { flattenAtoms } from "utils/charm/flatten-atoms";

/**
 * Signals broadcast identically to every client, flattened to slash-separated
 * keys for Charm Sync. Only public data belongs here — currently `chatTag`
 * (names + colors). A player's *private* `datastore` slice is synced per-player
 * instead (see {@link playerDataKey}), so it is deliberately absent.
 */
export const atoms = flattenAtoms({
	playersAtom: {
		chatTag: playersAtom.chatTag,
	},
});

export type GlobalAtoms = typeof atoms;

/**
 * The Charm Sync key that carries a single player's own `datastore` slice.
 *
 * Unique per player on purpose: Charm Sync's server tracks each key's getter in
 * one global table and silently drops a second getter registered under a key
 * that already exists (`charm-sync/server.luau`, `trackSignal`). A shared key
 * would therefore leak the first player's data to everyone. The server
 * (`getPlayerSignals`) and client (`sync.client`) must derive the key the same
 * way — hence this single helper.
 */
export function playerDataKey(userId: string): `playersAtom/data-${string}` {
	return `playersAtom/data-${userId}`;
}
