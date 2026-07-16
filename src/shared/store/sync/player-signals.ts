import { computed } from "@rbxts/charm";

import { getPlayerData } from "shared/store/atoms/player/atom";
import { atoms, type GlobalAtoms } from "shared/store/sync/atoms";

/**
 * Builds the signal map a single client is allowed to receive.
 *
 * Everything in `atoms` is forwarded as-is; only `playersAtom.datastore` is
 * overridden, with a `computed` narrowed to this player's own entry. That is
 * where per-player privacy is enforced: the sync layer can never hand a client
 * someone else's data, and scoping at the signal source means every payload
 * Charm produces for this client is already filtered.
 *
 * Spreading rather than re-listing each signal keeps this additive — a new atom,
 * or a new key on `playersAtom`, syncs automatically instead of silently going
 * missing until someone remembers to repeat it here.
 *
 * @param userId - The player the signals are built for.
 * @returns The signal map to register with `server.addSignalsToClient`.
 */
export function getPlayerSignals(userId: string): GlobalAtoms {
	return {
		...atoms,
		playersAtom: {
			...atoms.playersAtom,
			datastore: computed(() => ({ [userId]: getPlayerData(userId) })),
		},
	};
}
