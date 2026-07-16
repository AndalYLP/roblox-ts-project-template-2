import Vide, { read } from "@rbxts/vide";

import { Button } from "client/ui/components/primitive/button";
import { Text } from "client/ui/components/primitive/text";
import { px } from "client/ui/hooks/use-px";
import { palette } from "client/ui/theme";
import type { NotificationKind } from "types/notification";

const KIND_COLORS: Record<NotificationKind, Color3> = {
	error: Color3.fromRGB(226, 84, 84),
	info: Color3.fromRGB(0, 162, 255),
	success: Color3.fromRGB(72, 181, 104),
};

export interface ToastProps {
	kind: Vide.Derivable<NotificationKind>;
	message: Vide.Derivable<string>;
	onDismiss?: () => void;
}

export function Toast({ kind, message, onDismiss }: ToastProps): Vide.Node {
	return (
		<Button
			activated={onDismiss}
			backgroundColor={() => palette().surface}
			cornerRadius={() => new UDim(0, px(8))}
			native={{ AutomaticSize: Enum.AutomaticSize.Y, Text: "" }}
			size={() => UDim2.fromOffset(px(260), 0)}
		>
			<uistroke
				Color={() => KIND_COLORS[read(kind)]}
				Thickness={() => px(2)}
				ApplyStrokeMode={"Border"}
			/>
			<uipadding
				PaddingBottom={() => new UDim(0, px(10))}
				PaddingLeft={() => new UDim(0, px(12))}
				PaddingRight={() => new UDim(0, px(12))}
				PaddingTop={() => new UDim(0, px(10))}
			/>
			<Text
				font={Enum.Font.GothamMedium}
				native={{
					AutomaticSize: Enum.AutomaticSize.Y,
					TextWrapped: true,
					TextXAlignment: Enum.TextXAlignment.Left,
				}}
				size={UDim2.fromScale(1, 0)}
				text={message}
				textColor={() => palette().foreground}
				textSize={() => px(14)}
			/>
		</Button>
	);
}
