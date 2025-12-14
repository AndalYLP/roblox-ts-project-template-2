import { Players } from "@rbxts/services";
import Vide, { mount } from "@rbxts/vide";

import { App } from "client/ui/app";

export async function mountApp(): Promise<void> {
	mount(() => <App />, Players.LocalPlayer.WaitForChild("PlayerGui"));
}