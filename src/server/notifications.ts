import { events } from "server/network";

/**
 * Predefined server → client toast notifications. Import and call these from
 * anywhere on the server — services, Centurion commands, or plain modules — with
 * no dependency injection needed (`events` is a module singleton).
 *
 * Each entry owns its wording and default `kind` in one place, so call sites stay
 * free of scattered raw strings (the same catalog idea as `AnalyticsService`).
 * For genuinely one-off toasts you can still call `events.notification.show(...)`
 * / `.broadcast(...)` directly.
 *
 * Use these only for messages NOT backed by player data; state-backed
 * notifications should stay store-driven (see `NotificationController`).
 */
export const notifications = {
	/** Warns a single player about a moderation action — kept on screen longer. */
	moderationWarning(player: Player, reason: string): void {
		events.notification.show(player, `⚠️ Warning from a moderator: ${reason}`, "error", 8);
	},

	/** Announces an imminent server restart to every connected player. */
	serverRestart(minutes: number): void {
		// No `duration` → the client uses its default.
		events.notification.show.broadcast(`Server restarting in ${minutes} minute(s).`, "info");
	},
};
