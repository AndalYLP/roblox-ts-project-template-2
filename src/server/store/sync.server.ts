import { server } from "@rbxts/charm-sync";
import { events } from "server/network";
import { atoms } from "shared/store/sync/atoms";
import { filterPayload } from "shared/store/sync/filter-payload";

const syncer = server({ atoms });

syncer.connect((player, payload) => {
	events.store.sync(player, filterPayload(player, payload));
});

events.store.init.connect((player) => {
	syncer.hydrate(player);
});
