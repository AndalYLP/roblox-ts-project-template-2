import { client } from "@rbxts/charm-sync";
import type { SyncPayload } from "@rbxts/charm-sync";

import { events } from "client/network";
import { USER_ID } from "shared/constants/player";
import { playersAtom } from "shared/store/atoms/player/atom";
import { atoms, playerDataKey } from "shared/store/sync/atoms";
import type { PlayerSignals } from "shared/store/sync/player-signals";

// Mirror the server's registration: the shared signals plus this player's own
// data under their per-player key. Spreading keeps it additive, and the keys
// must match the server's exactly — a key the server never sends is never
// written to. `datastore` is intentionally not in `atoms` (it's per-player).
client.addSignals({
	...atoms,
	[playerDataKey(USER_ID)]: playersAtom.datastore,
});

events.store.sync.connect((payload) => {
	// The remote transports payloads opaquely (dynamic per-player keys); re-type
	// to what the server actually sent so `client.patch` can apply them.
	client.patch(payload as Array<SyncPayload<PlayerSignals, true>>);
});

events.store.init();
