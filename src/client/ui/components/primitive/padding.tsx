import { getDerivable } from "@rbxts/pretty-vide-utils";
import Vide from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

interface PaddingProps {
	children?: Vide.Node;
	padding: Derivable<number>;
}

export function PaddingComponent({ children, padding }: PaddingProps): Vide.Node {
	return (
		<uipadding
			PaddingBottom={() => new UDim(0, getDerivable(padding))}
			PaddingLeft={() => new UDim(0, getDerivable(padding))}
			PaddingRight={() => new UDim(0, getDerivable(padding))}
			PaddingTop={() => new UDim(0, getDerivable(padding))}
		>
			{children}
		</uipadding>
	);
}
