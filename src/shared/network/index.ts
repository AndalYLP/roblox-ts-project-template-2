import { Networking } from "@flamework/networking";

import type { DailyRewardClientToServerEvents } from "shared/network/remotes/daily-reward";
import type { MtxClientToServerEvents } from "shared/network/remotes/mtx";
import type { SettingsClientToServerEvents } from "shared/network/remotes/settings";
import type {
	StoreClientToServerEvents,
	StoreServerToClientEvents,
} from "shared/network/remotes/store";
import type { TextChannelServerToClientEvents } from "shared/network/remotes/text-channel";

/** Fired by client to server. */
interface ClientToServerEvents {
	dailyReward: DailyRewardClientToServerEvents;
	mtx: MtxClientToServerEvents;
	settings: SettingsClientToServerEvents;
	store: StoreClientToServerEvents;
}

/** Fired by server to client. */
interface ServerToClientEvents {
	store: StoreServerToClientEvents;
	textChannel: TextChannelServerToClientEvents;
}

/** Fired by client to server. */
interface ClientToServerFunctions {
	// This is just an example, use the same organization as Events.
	function(parameter1: string): number;
}

/** Fired by server to client. */
interface ServerToClientFunctions {
	// This is just an example, use the same organization as Events.
	function(parameter1: string): number;
}

export const globalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const globalFunctions = Networking.createFunction<
	ClientToServerFunctions,
	ServerToClientFunctions
>();
