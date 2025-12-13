import { client } from "@rbxts/charm-sync";
import { events } from "client/network"

import { atoms } from "shared/store/sync/atoms";

const syncer = client({ atoms });

events.store.sync.connect((payload) => {
	syncer.sync(payload)
})

events.store.init()