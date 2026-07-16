import { Boolean, CreateVideStory } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

import { usePx } from "client/ui/hooks/use-px";
import { SettingsPanel } from "client/ui/settings/settings";

export = CreateVideStory(
	{
		controls: {
			visible: Boolean(true),
		},
		vide: Vide,
	},
	({ controls }) => {
		usePx();

		return <SettingsPanel visible={() => controls.visible()} />;
	},
);
