import { useEventListener } from "@rbxts/pretty-vide-utils";
import { RunService } from "@rbxts/services";
import Vide, { source } from "@rbxts/vide";

import { px, usePx } from "client/ui/hooks/use-px";
import { GAME_NAME } from "shared/constants/core";

const BACKGROUND = Color3.fromRGB(15, 15, 20);
const FOREGROUND = Color3.fromRGB(235, 235, 235);
const ACCENT = Color3.fromRGB(90, 130, 245);
const ACCENT_LIGHT = Color3.fromRGB(160, 195, 255);
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
			<frame
				BackgroundColor3={BACKGROUND}
				BackgroundTransparency={transparency}
				BorderSizePixel={0}
				Size={UDim2.fromScale(1, 1)}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					Padding={() => new UDim(0, px(16))}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<textlabel
					AutomaticSize={Enum.AutomaticSize.XY}
					BackgroundTransparency={1}
					Font={Enum.Font.GothamBold}
					Text={GAME_NAME}
					TextColor3={FOREGROUND}
					TextSize={() => px(34)}
					TextTransparency={transparency}
				/>
				<frame BackgroundTransparency={1} Size={() => UDim2.fromOffset(px(28), px(28))}>
					<uicorner CornerRadius={new UDim(1, 0)} />
					<uistroke Color={ACCENT} Thickness={() => px(3)} Transparency={transparency}>
						<uigradient
							Color={new ColorSequence(ACCENT, ACCENT_LIGHT)}
							Rotation={rotation}
							Transparency={SPINNER_ARC}
						/>
					</uistroke>
				</frame>
				<textlabel
					BackgroundTransparency={1}
					Font={Enum.Font.GothamMedium}
					Size={() => UDim2.fromOffset(px(110), px(20))}
					Text={() => `loading${string.rep(".", dots())}`}
					TextColor3={FOREGROUND}
					TextSize={() => px(16)}
					TextTransparency={transparency}
				/>
			</frame>
		</screengui>
	);
}
