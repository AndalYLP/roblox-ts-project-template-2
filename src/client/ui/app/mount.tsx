import Vide, { mount } from "@rbxts/vide";

import { LOCAL_PLAYER } from "client/constants/player";
import { App } from "client/ui/app";

export async function mountApp(): Promise<void> {
	mount(() => <App />, LOCAL_PLAYER.WaitForChild("PlayerGui"));
}
