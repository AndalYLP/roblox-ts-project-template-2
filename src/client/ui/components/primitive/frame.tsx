import Vide from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

export interface FrameProps<T extends Instance = Frame> {
	anchor?: Derivable<Vector2>;
	backgroundColor?: Derivable<Color3>;
	backgroundTransparency?: Derivable<number>;
	children?: Vide.Node;
	cornerRadius?: Derivable<UDim>;
	native?: Vide.InstanceAttributes<T>;
	position?: Derivable<UDim2>;
	size?: Derivable<UDim2>;
	visible?: Derivable<boolean>;
}

export function Frame({
	anchor,
	backgroundColor,
	backgroundTransparency,
	children,
	cornerRadius,
	native,
	position,
	size,
	visible,
}: FrameProps): Vide.Node {
	return (
		<frame
			AnchorPoint={anchor ?? new Vector2(0.5, 0.5)}
			Position={position}
			Size={size}
			Visible={visible}
			BackgroundTransparency={backgroundTransparency}
			BackgroundColor3={backgroundColor}
			{...native}
		>
			{children}
			{cornerRadius ? <uicorner CornerRadius={cornerRadius} /> : undefined}
		</frame>
	);
}
