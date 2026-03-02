import Vide from "@rbxts/vide";
import type { Derivable } from "@rbxts/vide";

import type { FrameProps } from "client/ui/components/primitive/frame";

export interface ImageProps extends FrameProps<ImageLabel> {
	image?: Derivable<string>;
	scaleType?: Derivable<
		| "Fit"
		| "Slice"
		| "Stretch"
		| "Tile"
		| Enum.ScaleType.Crop
		| Enum.ScaleType.Fit
		| Enum.ScaleType.Slice
		| Enum.ScaleType.Stretch
		| Enum.ScaleType.Tile
	>;
	tileSize?: Derivable<UDim2>;
}

export function Image({
	anchor,
	backgroundColor,
	backgroundTransparency,
	children,
	cornerRadius,
	image,
	native,
	position,
	scaleType,
	size,
	tileSize,
	visible,
}: ImageProps): Vide.Node {
	return (
		<imagelabel
			Image={image}
			ScaleType={scaleType}
			TileSize={tileSize}
			BackgroundTransparency={backgroundTransparency ?? 1}
			BackgroundColor3={backgroundColor}
			AnchorPoint={anchor ?? new Vector2(0.5, 0.5)}
			Position={position ?? new UDim2(0.5, 0, 0.5, 0)}
			Size={size ?? new UDim2(1, 0, 1, 0)}
			Visible={visible}
			{...native}
		>
			{children}
			{cornerRadius ? <uicorner CornerRadius={cornerRadius} /> : undefined}
		</imagelabel>
	);
}
