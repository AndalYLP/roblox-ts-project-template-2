import Vide from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

import type { FrameProps } from "client/ui/components/primitive/frame";

export interface TextProps extends FrameProps<TextLabel> {
	font?: Derivable<Enum.Font>;
	text?: Derivable<string>;
	textColor?: Derivable<Color3>;
	textSize?: Derivable<number>;
}

export function Text({
	anchor,
	backgroundColor,
	backgroundTransparency,
	children,
	cornerRadius,
	font,
	native,
	position,
	size,
	text,
	textColor,
	textSize,
	visible,
}: TextProps): Vide.Node {
	return (
		<textlabel
			Text={text}
			TextSize={textSize}
			AnchorPoint={anchor ?? new Vector2(0.5, 0.5)}
			Position={position ?? new UDim2(0.5, 0, 0.5, 0)}
			Size={size ?? new UDim2(1, 0, 1, 0)}
			Visible={visible}
			BackgroundColor3={backgroundColor}
			BackgroundTransparency={backgroundTransparency ?? 1}
			TextColor3={textColor}
			Font={font ?? Enum.Font.FredokaOne}
			{...native}
		>
			{children}
			{cornerRadius ? <uicorner CornerRadius={cornerRadius} /> : undefined}
		</textlabel>
	);
}
