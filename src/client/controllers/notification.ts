import { Controller } from "@flamework/core";
import { subscribe } from "@rbxts/charm";
import { setTimeout } from "@rbxts/set-timeout";
import type { OnStart } from "@flamework/core";

import { events } from "client/network";
import { dismissNotification, pushNotification } from "client/ui/notifications/store";
import { USER_ID } from "shared/constants/player";
import { getDailyReward } from "shared/functions/daily-reward";
import { getPlayerDailyRewardData } from "shared/store/atoms/player/daily-reward";
import type { NotificationKind } from "types/notification";

/** How long a toast stays on screen, in seconds. */
const DEFAULT_DURATION = 4;

/**
 * Shows transient toast notifications. Inject this controller and call
 * {@link NotificationController.notify} from anywhere on the client.
 */
@Controller()
export class NotificationController implements OnStart {
	public onStart(): void {
		this.watchDailyReward();

		// Server-pushed toasts for messages not backed by player state
		// (announcements, moderation, restart warnings). See server/notifications.ts.
		// `duration` is optional over the wire; when omitted, `notify` falls back
		// to DEFAULT_DURATION.
		events.notification.show.connect((message, kind, duration) => {
			this.notify(message, kind, duration);
		});
	}

	/** Shows a toast that auto-dismisses after `duration` seconds. */
	public notify(
		message: string,
		kind: NotificationKind = "info",
		duration = DEFAULT_DURATION,
	): void {
		const id = pushNotification(message, kind);
		setTimeout(() => {
			dismissNotification(id);
		}, duration);
	}

	/** Toasts when the player's daily reward is claimed, driven by the synced store. */
	private watchDailyReward(): void {
		subscribe(
			() => getPlayerDailyRewardData(USER_ID),
			(current, previous) => {
				// Ignore the initial data load; only react to an actual new claim.
				if (!current || !previous || current.lastClaimTime === previous.lastClaimTime) {
					return;
				}

				const amount = getDailyReward(current.streak);
				this.notify(
					`Daily reward: +${amount} coins! (streak ${current.streak})`,
					"success",
				);
			},
		);
	}
}
