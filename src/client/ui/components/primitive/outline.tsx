import { getDerivable } from "@rbxts/pretty-vide-utils";
import Vide, { derive } from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

import { Group } from "client/ui/components/primitive/group";
import { px } from "client/ui/hooks/use-px";

export interface OutlineProps {
	children?: Vide.Node;
	cornerRadius?: Derivable<UDim>;
	innerColor?: Derivable<Color3>;
	innerThickness?: Derivable<number>;
	innerTransparency?: Derivable<number>;
	outerColor?: Derivable<Color3>;
	outerThickness?: Derivable<number>;
	outerTransparency?: Derivable<number>;
	outlineTransparency?: Derivable<number>;
}

function ceilEven(number: number): number {
	return math.ceil(number / 2) * 2;
}

export function Outline({
	children,
	cornerRadius,
	innerColor,
	innerThickness,
	innerTransparency,
	outerColor,
	outerThickness,
	outerTransparency,
	outlineTransparency,
}: OutlineProps): Vide.Node {
	innerThickness ??= px(0);
	outerThickness ??= px(0);

	const innerSize = derive(() => {
		return new UDim2(
			1,
			ceilEven(-2 * getDerivable(innerThickness)),
			1,
			ceilEven(-2 * getDerivable(innerThickness)),
		);
	});

	const innerPosition = derive(() => {
		return new UDim2(0, getDerivable(innerThickness), 0, getDerivable(innerThickness));
	});

	const innerRadius = derive(() => {
		if (cornerRadius === undefined) {
			return new UDim(0, 0);
		}

		return getDerivable(cornerRadius).sub(new UDim(0, getDerivable(innerThickness)));
	});

	const innerTransparencyStyle = derive(() => {
		let result: number = 1;

		result *= 1 - (getDerivable(innerTransparency) ?? 0);
		result *= 1 - (getDerivable(outlineTransparency) ?? 0);

		return math.clamp(1 - result, 0, 1);
	});

	const outerTransparencyStyle = derive(() => {
		let result: number = 1;

		result *= 1 - (getDerivable(outerTransparency) ?? 0);
		result *= 1 - (getDerivable(outlineTransparency) ?? 0);

		return math.clamp(1 - result, 0, 1);
	});

	return (
		<>
			<Group
				native={{
					AnchorPoint: new Vector2(0, 0),
					Position: innerPosition,
					Size: innerSize,
				}}
			>
				{cornerRadius ? <uicorner CornerRadius={innerRadius} /> : undefined}
				<uistroke
					Color={innerColor}
					Thickness={innerThickness}
					Transparency={innerTransparencyStyle}
				>
					{children}
				</uistroke>
			</Group>

			<Group>
				<uistroke
					Color={outerColor}
					Thickness={outerThickness}
					Transparency={outerTransparencyStyle}
				>
					{children}
				</uistroke>

				{cornerRadius ? <uicorner CornerRadius={cornerRadius} /> : undefined}
			</Group>
		</>
	);
}
