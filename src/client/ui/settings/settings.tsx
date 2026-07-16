import Vide, { source } from "@rbxts/vide";

import { Button } from "client/ui/components/primitive/button";
import { Frame } from "client/ui/components/primitive/frame";
import { PaddingComponent } from "client/ui/components/primitive/padding";
import { Text } from "client/ui/components/primitive/text";
import { SPACING } from "client/ui/constants";
import { px, usePx } from "client/ui/hooks/use-px";
import { VolumeRow } from "client/ui/settings/volume-row";
import { palette } from "client/ui/theme";

export interface SettingsPanelProps {
	onClose?: () => void;
	/** Whether the panel is shown. Omit to keep it always visible (e.g. stories). */
	visible?: () => boolean;
}

/** The settings card itself, with music/SFX volume controls. */
export function SettingsPanel({ onClose, visible }: SettingsPanelProps): Vide.Node {
	return (
		<Frame
			anchor={new Vector2(0.5, 0.5)}
			backgroundColor={() => palette().surface}
			cornerRadius={() => new UDim(0, px(12))}
			position={UDim2.fromScale(0.5, 0.5)}
			size={() => UDim2.fromOffset(px(300), px(184))}
			visible={visible}
		>
			<PaddingComponent padding={() => px(SPACING.padding)} />
			<uilistlayout
				Padding={() => new UDim(0, px(12))}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>
			<Text
				font={Enum.Font.GothamBold}
				native={{ LayoutOrder: 0, TextXAlignment: Enum.TextXAlignment.Left }}
				size={() => new UDim2(1, 0, 0, px(24))}
				text="Settings"
				textColor={() => palette().foreground}
				textSize={() => px(20)}
			/>
			<VolumeRow label="Music" layoutOrder={1} setting="musicVolume" />
			<VolumeRow label="SFX" layoutOrder={2} setting="sfxVolume" />
			<Button
				activated={onClose}
				backgroundColor={() => palette().surfaceLight}
				cornerRadius={() => new UDim(0, px(8))}
				native={{
					Font: Enum.Font.GothamMedium,
					LayoutOrder: 3,
					Text: "Close",
					TextColor3: () => palette().foreground,
					TextSize: () => px(15),
				}}
				size={() => new UDim2(1, 0, 0, px(32))}
			/>
		</Frame>
	);
}

/** A settings panel toggled by a gear button in the top-left corner. */
export function Settings(): Vide.Node {
	usePx();

	const open = source(false);

	return (
		<screengui DisplayOrder={50} ResetOnSpawn={false}>
			<SettingsPanel onClose={() => open(false)} visible={open} />
			<Button
				activated={() => open(!open())}
				backgroundColor={() => palette().surface}
				cornerRadius={() => new UDim(0, px(8))}
				native={{
					AnchorPoint: new Vector2(0, 0),
					Font: Enum.Font.GothamBold,
					Text: "⚙",
					TextColor3: () => palette().foreground,
					TextSize: () => px(22),
				}}
				position={() =>
					UDim2.fromOffset(px(SPACING.screenMargin), px(SPACING.screenMargin))
				}
				size={() => UDim2.fromOffset(px(40), px(40))}
			/>
		</screengui>
	);
}
