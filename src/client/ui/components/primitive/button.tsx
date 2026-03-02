import Vide from "@rbxts/vide";

import type { FrameProps } from "client/ui/components/primitive/frame";

export interface ButtonProps extends FrameProps<TextButton> {
	activated?: (inputObject: InputObject, clickCount: number) => void;
	mouseButton1Down?: (x: number, y: number) => void;
	mouseButton1Up?: (x: number, y: number) => void;
	mouseEnter?: (x: number, y: number) => void;
	mouseLeave?: (x: number, y: number) => void;
}

export function Button({
	activated,
	anchor,
	backgroundColor,
	backgroundTransparency,
	children,
	cornerRadius,
	mouseButton1Down,
	mouseButton1Up,
	mouseEnter,
	mouseLeave,
	native,
	position,
	size,
	visible,
}: ButtonProps): Vide.Node {
	return (
		<textbutton
			AnchorPoint={anchor ?? new Vector2(0.5, 0.5)}
			Position={position}
			Size={size}
			Activated={activated}
			MouseEnter={mouseEnter}
			MouseLeave={mouseLeave}
			MouseButton1Down={mouseButton1Down}
			BackgroundColor3={backgroundColor}
			MouseButton1Up={mouseButton1Up}
			Visible={visible}
			BackgroundTransparency={backgroundTransparency}
			{...native}
		>
			{children}
			{cornerRadius ? <uicorner CornerRadius={cornerRadius} /> : undefined}
		</textbutton>
	);
}
