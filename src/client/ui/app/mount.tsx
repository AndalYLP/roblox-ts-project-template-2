import Vide, { mount } from "@rbxts/vide";

import { LocalPlayer } from "client/constants/player";
import { App } from "client/ui/app";

export async function mountApp(): Promise<void> {
	mount(() => <App />, LocalPlayer.WaitForChild("PlayerGui"));
}
