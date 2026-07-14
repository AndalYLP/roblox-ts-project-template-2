import Vide from "@rbxts/vide";

import { Button } from "client/ui/components/primitive/button";
import { px } from "client/ui/hooks/use-px";
import { palette } from "client/ui/theme";

export interface StepButtonProps {
	label: string;
	layoutOrder?: number;
	onClick: () => void;
}

/** A small square button with a text label — e.g. a `−` / `+` stepper. */
export function StepButton({ label, layoutOrder, onClick }: StepButtonProps): Vide.Node {
	return (
		<Button
			activated={onClick}
			backgroundColor={() => palette().surfaceLight}
			cornerRadius={() => new UDim(0, px(6))}
			native={{
				Font: Enum.Font.GothamBold,
				LayoutOrder: layoutOrder,
				Text: label,
				TextColor3: () => palette().foreground,
				TextSize: () => px(18),
			}}
			size={() => UDim2.fromOffset(px(28), px(28))}
		/>
	);
}
