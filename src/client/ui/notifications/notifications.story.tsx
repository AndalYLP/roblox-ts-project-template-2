import { Choose, CreateVideStory, String } from "@rbxts/ui-labs";
import Vide from "@rbxts/vide";

import { usePx } from "client/ui/hooks/use-px";
import { Toast } from "client/ui/notifications/toast";
import type { NotificationKind } from "types/notification";

export = CreateVideStory(
	{
		controls: {
			kind: Choose<NotificationKind>(["success", "info", "error"]),
			message: String("Daily reward: +100 coins!"),
		},
		vide: Vide,
	},
	({ controls }) => {
		usePx();

		return <Toast kind={() => controls.kind()} message={() => controls.message()} />;
	},
);
