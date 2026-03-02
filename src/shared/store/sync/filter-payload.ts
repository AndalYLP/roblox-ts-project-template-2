import type { SyncPayload } from "@rbxts/charm-sync";

import type { GlobalAtoms } from "shared/store/sync/atoms";

/**
 * Filters the payload to only include the player's data.
 *
 * @param player The player to send the payload to.
 * @param payload The payload to filter.
 * @returns A new payload that only includes the player's data.
 */
export function filterPayload(
	player: Player,
	payload: SyncPayload<GlobalAtoms>,
): SyncPayload<GlobalAtoms> {
	const userId = tostring(player.UserId);

	if (payload.type === "init") {
		return {
			...payload,
			data: {
				...payload.data,
				"playersAtom/datastore": {
					[userId]: payload.data["playersAtom/datastore"][userId],
				},
			},
		};
	}

	return {
		...payload,
		data: {
			...payload.data,
			"playersAtom/datastore": payload.data["playersAtom/datastore"] && {
				[userId]: payload.data["playersAtom/datastore"][userId],
			},
		},
	};
}
