import { Service } from "@flamework/core";
import { t } from "@rbxts/t";
import type { OnStart } from "@flamework/core";

import { events } from "server/network";
import { changeSetting } from "shared/store/atoms/player/settings";
import type { PlayerService } from "server/services/player";

/**
 * Applies player-requested settings changes. Settings are server-authoritative
 * (persisted through the player data store), so the client requests changes
 * through `events.settings` and this service validates and applies them.
 */
@Service()
export class SettingsService implements OnStart {
	constructor(private readonly playerService: PlayerService) {}

	public onStart(): void {
		events.settings.setAudioVolume.connect(
			this.playerService.withPlayerEntity((playerEntity, setting, value) => {
				if (!t.number(value)) {
					return;
				}

				changeSetting(playerEntity.userId, "audio", setting, math.clamp(value, 0, 1));
			}),
		);
	}
}
