import Vide, { mount } from "@rbxts/vide";

import { PLAYER_GUI } from "client/constants/player";
import { App } from "client/ui/app";
import { Notifications } from "client/ui/notifications/notifications";
import { Settings } from "client/ui/settings/settings";

export async function mountApp(): Promise<void> {
	mount(() => <App />, PLAYER_GUI);
	mount(() => <Notifications />, PLAYER_GUI);
	mount(() => <Settings />, PLAYER_GUI);
}
