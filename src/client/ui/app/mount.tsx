import Vide, { mount } from "@rbxts/vide";

import { PLAYER_GUI } from "client/constants/player";
import { App } from "client/ui/app";

export async function mountApp(): Promise<void> {
	mount(() => <App />, PLAYER_GUI);
}
