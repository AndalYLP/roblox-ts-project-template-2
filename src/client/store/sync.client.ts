import { client } from "@rbxts/charm-sync";

import { events } from "client/network";
import { atoms } from "shared/store/sync/atoms";

client.addSignals({ atoms });

events.store.sync.connect((payload) => {
	client.patch(payload);
});

events.store.init();
