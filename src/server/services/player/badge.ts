import { Service } from "@flamework/core";
import type { Logger } from "@rbxts/log";
import { BadgeService } from "@rbxts/services";
import type { OnPlayerJoin } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";
import { getPlayerAchievements, setBadgeStatus } from "shared/store/atoms/player/achievements";
import { type Badge, badge } from "types/enums/badge";

@Service()
export class PlayerBadgeService implements OnPlayerJoin {
	constructor(private readonly logger: Logger) {}

	/** @ignore */
	public onPlayerJoin(playerEntity: PlayerEntity): void {
		const { UserId } = playerEntity;

		this.awardBadge(playerEntity, badge.Welcome).catch((err) => {
			this.logger.Error(`Failed to check if ${UserId} has badge ${badge.Welcome}: ${err}`);
		});

		this.awardUnrewardedBadges(playerEntity).catch((err) => {
			this.logger.Error(`Failed to award unrewarded badges to ${UserId}: ${err}`);
		});
	}

	/**
	 * Awards a badge to a player if they don't already have it.
	 *
	 * If the badge is unable to be awarded, the error will be logged and the
	 * badge will not be awarded. We will still internally track that the badge
	 * was attempted to be awarded so that any function that relies on a badge
	 * having been awarded will consider it as awarded.
	 *
	 * @param playerEntity - The player entity to award the badge to.
	 * @param badge - The badge to be awarded.
	 * @returns A promise that resolves when the badge has been awarded.
	 */
	public async awardBadge(playerEntity: PlayerEntity, badgeId: Badge): Promise<void> {
		const hasBadge = await this.checkIfPlayerHasBadge(playerEntity, badgeId);
		if (hasBadge) {
			return;
		}

		return this.giveBadge(playerEntity, badgeId);
	}

	public async checkIfPlayerHasBadge(
		{ player, UserId }: PlayerEntity,
		badge: Badge,
	): Promise<boolean> {
		const hasBadge = getPlayerAchievements(UserId)?.badges.get(badge);
		if (hasBadge !== undefined) {
			return true;
		}

		return Promise.try(() => BadgeService.UserHasBadgeAsync(player.UserId, tonumber(badge)!));
	}

	public async getBadgeInfo(badge: Badge): Promise<BadgeInfo> {
		return Promise.try(() => BadgeService.GetBadgeInfoAsync(tonumber(badge)!));
	}

	private async giveBadge({ player, UserId }: PlayerEntity, badgeId: Badge): Promise<void> {
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
			this.logger.Warn(`Awarded badge ${badgeId} to ${UserId} but it was not successful.`);
		} else {
			this.logger.Info(`Awarded badge ${badgeId} to ${UserId}`);
		}

		setBadgeStatus(UserId, badgeId, awarded);
	}

	private async awardUnrewardedBadges(playerEntity: PlayerEntity): Promise<void> {
		const { UserId } = playerEntity;

		const badges = getPlayerAchievements(UserId)?.badges;
		if (badges === undefined) {
			return;
		}

		for (const [badge, hasBadge] of badges) {
			if (hasBadge) {
				continue;
			}

			this.awardBadge(playerEntity, badge).catch((err) => {
				this.logger.Error(`Failed to check if ${UserId} has badge ${badge}: ${err}`);
			});
		}
	}
}
