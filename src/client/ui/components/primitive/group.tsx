import Vide from "@rbxts/vide";

export interface GroupProps {
	children?: Vide.Node;
	native?: Vide.InstanceAttributes<Frame>;
}

export function Group({ children, native }: GroupProps): Vide.Node {
	return (
		<frame
			BackgroundTransparency={1}
			Size={new UDim2(1, 0, 1, 0)}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			{...native}
		>
			{children}
		</frame>
	);
}
