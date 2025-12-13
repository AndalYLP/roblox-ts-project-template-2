import { SyncPayload } from "@rbxts/charm-sync";
import { GlobalAtoms } from "shared/store/sync/atoms";

export interface StoreClientToServerEvents {
	init: () => void
}

export interface StoreServerToClientEvents {
	sync: (payload: SyncPayload<GlobalAtoms>) => void;
}