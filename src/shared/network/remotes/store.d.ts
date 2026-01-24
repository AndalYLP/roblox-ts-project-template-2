import type { SyncPayload } from "@rbxts/charm-sync";

import type { GlobalAtoms } from "shared/store/sync/atoms";

export interface StoreClientToServerEvents {
	init: () => void;
}

export interface StoreServerToClientEvents {
	sync: (payload: SyncPayload<GlobalAtoms>) => void;
}
