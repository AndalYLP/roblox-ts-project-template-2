import { source } from "@rbxts/vide";

import type { NotificationKind } from "types/notification";

export interface Notification {
	readonly id: number;
	readonly kind: NotificationKind;
	readonly message: string;
}

const notificationList = source<ReadonlyArray<Notification>>([]);
let nextId = 0;

/** Reactive source of the notifications currently on screen. */
export function notifications(): ReadonlyArray<Notification> {
	return notificationList();
}

/** Adds a notification and returns its id (used to dismiss it). */
export function pushNotification(message: string, kind: NotificationKind = "info"): number {
	const id = nextId++;
	notificationList([...notificationList(), { id, kind, message }]);
	return id;
}

/** Removes a notification by id. */
export function dismissNotification(id: number): void {
	notificationList(notificationList().filter((notification) => notification.id !== id));
}
