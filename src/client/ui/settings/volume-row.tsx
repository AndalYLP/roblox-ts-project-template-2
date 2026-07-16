import { subscribe } from "@rbxts/charm";
import Vide, { cleanup, source } from "@rbxts/vide";

import { events } from "client/network";
import { Frame } from "client/ui/components/primitive/frame";
import { Text } from "client/ui/components/primitive/text";
import { StepButton } from "client/ui/components/step-button";
import { SPACING } from "client/ui/constants";
import { px } from "client/ui/hooks/use-px";
import { palette } from "client/ui/theme";
import { USER_ID } from "shared/constants/player";
import { getPlayerSetting } from "shared/store/atoms/player/settings";
import type { AudioSetting } from "shared/network/remotes/settings";

/** How much each `-`/`+` press changes the volume. */
const STEP = 0.1;

export interface VolumeRowProps {
	label: string;
	layoutOrder: number;
	setting: AudioSetting;
}

/** A row that shows and adjusts one audio volume setting with `−` / `+` steppers. */
export function VolumeRow({ label, layoutOrder, setting }: VolumeRowProps): Vide.Node {
	const volume = source(getPlayerSetting(USER_ID, "audio", setting) ?? 1);
	// Keep the row in sync with the server-authoritative (and persisted) value.
	cleanup(
		subscribe(
			() => getPlayerSetting(USER_ID, "audio", setting),
			(value) => {
				volume(value ?? 1);
			},
		),
	);

	function step(delta: number): void {
		const clamped = math.clamp(math.round((volume() + delta) * 10) / 10, 0, 1);
		// Update locally first so rapid presses accumulate off the latest value
		// instead of each reading the same server-echoed one; the subscribe above
		// reconciles once the authoritative value replicates back.
		volume(clamped);
		events.settings.setAudioVolume(setting, clamped);
	}

	return (
		<Frame
			backgroundTransparency={1}
			native={{ LayoutOrder: layoutOrder }}
			size={() => new UDim2(1, 0, 0, px(28))}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={() => new UDim(0, px(SPACING.gap))}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<Text
				font={Enum.Font.GothamMedium}
				native={{ LayoutOrder: 0, TextXAlignment: Enum.TextXAlignment.Left }}
				size={() => UDim2.fromOffset(px(80), px(28))}
				text={label}
				textColor={() => palette().foreground}
				textSize={() => px(15)}
			/>
			<StepButton label="−" layoutOrder={1} onClick={() => step(-STEP)} />
			<Text
				font={Enum.Font.GothamMedium}
				native={{ LayoutOrder: 2 }}
				size={() => UDim2.fromOffset(px(48), px(28))}
				text={() => `${math.round(volume() * 100)}%`}
				textColor={() => palette().foreground}
				textSize={() => px(15)}
			/>
			<StepButton label="+" layoutOrder={3} onClick={() => step(STEP)} />
		</Frame>
	);
}
