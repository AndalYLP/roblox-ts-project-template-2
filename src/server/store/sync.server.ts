import { server } from "@rbxts/charm-sync";
import { Players } from "@rbxts/services";

import { events } from "server/network";
import { getPlayerSignals } from "shared/store/sync/player-signals";
import type { PlayerSignals } from "shared/store/sync/player-signals";

events.store.init.connect((player) => {
	// Each client is registered with signals already scoped to them — their own
	// data under a per-player key — so payloads need no further filtering below.
	server.addSignalsToClient<PlayerSignals>(player, getPlayerSignals(tostring(player.UserId)));
});

Players.PlayerRemoving.Connect((player) => {
	server.removeClient(player);
});

server.connect<PlayerSignals>((player, payloads) => {
	events.store.sync(player, payloads);
});
