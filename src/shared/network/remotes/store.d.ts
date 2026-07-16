export interface StoreClientToServerEvents {
	init: () => void;
}

export interface StoreServerToClientEvents {
	/**
	 * A batch of Charm Sync state payloads. Kept opaque (`defined`) on purpose:
	 * each player's data rides under a dynamic, per-player key (see
	 * `playerDataKey`), and Flamework can't build a runtime guard for a
	 * template-literal index. The typed boundaries are `server.connect` (server)
	 * and `client.patch` (client) — this event is only the transport between them.
	 */
	sync: (payload: Array<defined>) => void;
}
