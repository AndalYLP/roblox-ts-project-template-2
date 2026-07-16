import { server } from "@rbxts/charm-sync";
import { Players } from "@rbxts/services";

import { events } from "server/network";
import { getPlayerSignals } from "shared/store/sync/player-signals";
import type { GlobalAtoms } from "shared/store/sync/atoms";

events.store.init.connect((player) => {
	// Each client is registered with signals already scoped to them, so payloads
	// need no further filtering below.
	server.addSignalsToClient<GlobalAtoms>(player, getPlayerSignals(tostring(player.UserId)));
});

Players.PlayerRemoving.Connect((player) => {
	server.removeClient(player);
});

server.connect<GlobalAtoms>((player, payloads) => {
	events.store.sync(player, payloads);
});
