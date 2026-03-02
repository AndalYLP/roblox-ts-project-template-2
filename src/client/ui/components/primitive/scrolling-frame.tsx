import { getDerivable } from "@rbxts/pretty-vide-utils";
import Vide from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

interface ScrollingFrameProps {
	canvasSize: Derivable<Vector2>;
	children?: Vide.Node;
	native?: Partial<Omit<Vide.InstanceAttributes<ScrollingFrame>, "BackgroundTransparency">>;
	srollBarThickness?: Derivable<number>;
}

export function ScrollingFrame({
	canvasSize,
	children,
	native,
	srollBarThickness,
}: ScrollingFrameProps): Vide.Node {
	return (
		<scrollingframe
			AnchorPoint={new Vector2(0.5, 0.5)}
			BackgroundTransparency={1}
			CanvasSize={() =>
				UDim2.fromOffset(getDerivable(canvasSize).X, getDerivable(canvasSize).Y)
			}
			Position={new UDim2(0.5, 0, 0.5, 0)}
			ScrollBarThickness={srollBarThickness}
			Size={new UDim2(1, 0, 1, 0)}
			{...native}
		>
			{children}
		</scrollingframe>
	);
}
