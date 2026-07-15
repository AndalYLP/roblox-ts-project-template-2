import { Service } from "@flamework/core";
import { BadgeService } from "@rbxts/services";
import type { Logger } from "@rbxts/log";

import { getPlayerAchievementsData, setBadgeStatus } from "shared/store/atoms/player/achievements";
import { type Badge, badge } from "types/enums/badge";
import type { OnPlayerJoin } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

@Service()
export class PlayerBadgeService implements OnPlayerJoin {
	constructor(private readonly logger: Logger) {}

	public onPlayerJoin(playerEntity: PlayerEntity): void {
		const { userId } = playerEntity;

		this.awardBadge(playerEntity, badge.Welcome).catch((err) => {
			this.logger.Error(`Failed to award badge ${badge.Welcome} to ${userId}: ${err}`);
		});

		this.awardUnrewardedBadges(playerEntity).catch((err) => {
			this.logger.Error(`Failed to award unrewarded badges to ${userId}: ${err}`);
		});
	}

	/**
	 * Awards a badge to a player if they don't already own it.
	 *
	 * A failed award (Roblox returned false, or the badge is disabled) is recorded
	 * as not-yet-granted rather than owned, so
	 * {@link PlayerBadgeService.awardUnrewardedBadges} can retry it on a later join.
	 *
	 * @param playerEntity - The player entity to award the badge to.
	 * @param badgeId - The badge to be awarded.
	 * @returns A promise that resolves when the badge has been awarded.
	 */
	public async awardBadge(playerEntity: PlayerEntity, badgeId: Badge): Promise<void> {
		if (await this.checkIfPlayerHasBadge(playerEntity, badgeId)) {
			return;
		}

		return this.giveBadge(playerEntity, badgeId);
	}

	/**
	 * Whether the player owns the badge. A locally-confirmed award is trusted
	 * without a network call; otherwise the authoritative Roblox state is queried
	 * and a positive result is cached so we don't ask again.
	 *
	 * A stored `false` — a prior award attempt Roblox rejected — is treated as
	 * "not owned" so it can be retried; it must NOT be collapsed into "owned".
	 */
	public async checkIfPlayerHasBadge(
		{ player, userId }: PlayerEntity,
		badgeId: Badge,
	): Promise<boolean> {
		if (getPlayerAchievementsData(userId)?.badges.get(badgeId) === true) {
			return true;
		}

		const owned = await Promise.try(() =>
			BadgeService.UserHasBadgeAsync(player.UserId, tonumber(badgeId)!),
		);
		if (owned) {
			setBadgeStatus(userId, badgeId, true);
		}

		return owned;
	}

	public async getBadgeInfo(badgeId: Badge): Promise<BadgeInfo> {
		return Promise.try(() => BadgeService.GetBadgeInfoAsync(tonumber(badgeId)!));
	}

	private async awardUnrewardedBadges(playerEntity: PlayerEntity): Promise<void> {
		const { userId } = playerEntity;

		const badges = getPlayerAchievementsData(userId)?.badges;
		if (badges === undefined) {
			return;
		}

		// Retry every badge a prior attempt recorded as not-yet-granted (`false`).
		for (const [badgeId, awarded] of badges) {
			if (awarded) {
				continue;
			}

			this.awardBadge(playerEntity, badgeId).catch((err) => {
				this.logger.Error(`Failed to retry badge ${badgeId} for ${userId}: ${err}`);
			});
		}
	}

	private async giveBadge({ player, userId }: PlayerEntity, badgeId: Badge): Promise<void> {
		const badgeInfo = await this.getBadgeInfo(badgeId);
		if (!badgeInfo.IsEnabled) {
			this.logger.Warn(`Badge ${badgeId} is not enabled.`);
			return;
		}

		const [success, awarded] = pcall(() =>
			BadgeService.AwardBadgeAsync(player.UserId, tonumber(badgeId)!),
		);
		if (!success) {
			throw awarded;
		}

		if (!awarded) {
			this.logger.Warn(`Awarded badge ${badgeId} to ${userId} but it was not successful.`);
		} else {
			this.logger.Info(`Awarded badge ${badgeId} to ${userId}`);
		}

		setBadgeStatus(userId, badgeId, awarded);
	}
}
