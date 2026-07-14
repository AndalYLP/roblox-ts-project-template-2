import type { NotificationKind } from "types/notification";

export interface NotificationServerToClientEvents {
	/**
	 * Shows a transient toast on the client. Use this for messages that are NOT
	 * backed by player data — server restart warnings, moderation notices, global
	 * announcements. Notifications that reflect player state should stay
	 * store-driven instead (have the client subscribe to the atom and react).
	 *
	 * @param message - The text to display.
	 * @param kind - The visual style / severity of the toast.
	 */
	show: (message: string, kind: NotificationKind) => void;
}
