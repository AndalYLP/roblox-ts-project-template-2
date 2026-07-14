import { Service } from "@flamework/core";
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
				changeSetting(playerEntity.userId, "audio", setting, math.clamp(value, 0, 1));
			}),
		);

		// The theme value is guarded to `ThemeName` by Flamework networking.
		events.settings.setTheme.connect(
			this.playerService.withPlayerEntity((playerEntity, theme) => {
				changeSetting(playerEntity.userId, "display", "theme", theme);
			}),
		);
	}
}
