import Vide, { For } from "@rbxts/vide";

import { Frame } from "client/ui/components/primitive/frame";
import { SPACING } from "client/ui/constants";
import { px, usePx } from "client/ui/hooks/use-px";
import { dismissNotification, notifications } from "client/ui/notifications/store";
import { Toast } from "client/ui/notifications/toast";

/** Bottom-left stack of toast notifications. */
export function Notifications(): Vide.Node {
	usePx();

	return (
		<screengui DisplayOrder={100} ResetOnSpawn={false}>
			<Frame
				anchor={new Vector2(0, 1)}
				backgroundTransparency={1}
				native={{ AutomaticSize: Enum.AutomaticSize.Y }}
				position={() =>
					new UDim2(0, px(SPACING.screenMargin), 1, -px(SPACING.screenMargin))
				}
				size={() => UDim2.fromOffset(px(260), 0)}
			>
				<uilistlayout
					HorizontalAlignment={Enum.HorizontalAlignment.Left}
					Padding={() => new UDim(0, px(SPACING.gap))}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Bottom}
				/>
				<For each={notifications}>
					{(notification) => (
						<Toast
							kind={notification.kind}
							message={notification.message}
							onDismiss={() => dismissNotification(notification.id)}
						/>
					)}
				</For>
			</Frame>
		</screengui>
	);
}
