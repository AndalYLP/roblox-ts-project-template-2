import { useEventListener } from "@rbxts/pretty-vide-utils";
import { RunService } from "@rbxts/services";
import Vide, { source } from "@rbxts/vide";

import { Frame } from "client/ui/components/primitive/frame";
import { Text } from "client/ui/components/primitive/text";
import { px, usePx } from "client/ui/hooks/use-px";
import { palette } from "client/ui/theme";
import { GAME_NAME } from "shared/constants/core";

/** Spinner rotation speed, in degrees per second. */
const SPIN_SPEED = 200;
/** Seconds each step of the "loading…" dot cycle is shown. */
const DOT_STEP = 0.35;
/** Fades the stroke around the ring so the spinner reads as an arc. */
const SPINNER_ARC = new NumberSequence([
	new NumberSequenceKeypoint(0, 1),
	new NumberSequenceKeypoint(1, 0),
]);

export interface LoadingScreenProps {
	/** Fade level: `0` fully visible, `1` fully faded out. */
	transparency: () => number;
}

export function LoadingScreen({ transparency }: LoadingScreenProps): Vide.Node {
	usePx();

	const rotation = source(0);
	const dots = source(1);

	useEventListener(RunService.RenderStepped, (deltaTime) => {
		rotation((rotation() + SPIN_SPEED * deltaTime) % 360);

		const dotCount = (math.floor(os.clock() / DOT_STEP) % 3) + 1;
		if (dotCount !== dots()) {
			dots(dotCount);
		}
	});

	return (
		<screengui DisplayOrder={1_000_000} IgnoreGuiInset={true} ResetOnSpawn={false}>
			<Frame
				backgroundColor={() => palette().background}
				backgroundTransparency={transparency}
				native={{ BorderSizePixel: 0 }}
				position={UDim2.fromScale(0.5, 0.5)}
				size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={() => new UDim(0, px(16))}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<Text
					font={Enum.Font.GothamBold}
					native={{
						AutomaticSize: Enum.AutomaticSize.XY,
						TextTransparency: transparency,
					}}
					text={GAME_NAME}
					textColor={() => palette().foreground}
					textSize={() => px(34)}
				/>
				<Frame
					backgroundTransparency={1}
					cornerRadius={new UDim(1, 0)}
					size={() => UDim2.fromOffset(px(28), px(28))}
				>
					<uistroke
						Color={() => palette().accent}
						Thickness={() => px(3)}
						Transparency={transparency}
					>
						<uigradient
							Color={() => new ColorSequence(palette().accent, palette().accentLight)}
							Rotation={rotation}
							Transparency={SPINNER_ARC}
						/>
					</uistroke>
				</Frame>
				<Text
					font={Enum.Font.GothamMedium}
					native={{ TextTransparency: transparency }}
					size={() => UDim2.fromOffset(px(110), px(20))}
					text={() => `loading${string.rep(".", dots())}`}
					textColor={() => palette().foreground}
					textSize={() => px(16)}
				/>
			</Frame>
		</screengui>
	);
}
