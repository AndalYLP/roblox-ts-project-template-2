import { Service } from "@flamework/core";
import type { OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log";

import { events } from "server/network";
import { Currency } from "server/services/analytics";
import { getDailyReward } from "shared/functions/daily-reward";
import { addBalance, getPlayerBalanceData } from "shared/store/atoms/player/balance";
import {
	getPlayerDailyRewardData,
	recordDailyRewardClaim,
} from "shared/store/atoms/player/daily-reward";
import type { AnalyticsService } from "server/services/analytics";
import type { PlayerService } from "server/services/player";
import type { PlayerEntity } from "server/services/player/entity";

const DAY_SECONDS = 24 * 60 * 60;

export interface ClaimResult {
	amount: number;
	streak: number;
}

/**
 * Grants a once-per-day reward that grows with a consecutive-day streak. The
 * client requests a claim through `events.dailyReward.claim`; use
 * {@link DailyRewardService.canClaim} to drive availability in the UI.
 */
@Service()
export class DailyRewardService implements OnStart {
	constructor(
		private readonly logger: Logger,
		private readonly playerService: PlayerService,
		private readonly analyticsService: AnalyticsService,
	) {}

	public onStart(): void {
		events.dailyReward.claim.connect(
			this.playerService.withPlayerEntity((playerEntity) => {
				this.claim(playerEntity);
			}),
		);
	}

	/** Whether the player has a reward available to claim right now. */
	public canClaim(userId: string): boolean {
		const data = getPlayerDailyRewardData(userId);
		if (!data) {
			return false;
		}

		return this.dayIndex(os.time()) > this.dayIndex(data.lastClaimTime);
	}

	/**
	 * Claims today's reward if one is available: grants currency, advances (or
	 * resets) the streak, and logs analytics.
	 *
	 * @param playerEntity - The player claiming.
	 * @returns The granted amount and new streak, or `undefined` if nothing was
	 *   available to claim.
	 */
	public claim(playerEntity: PlayerEntity): ClaimResult | undefined {
		const { player, userId } = playerEntity;

		const data = getPlayerDailyRewardData(userId);
		if (!data) {
			return undefined;
		}

		const today = this.dayIndex(os.time());
		const lastDay = this.dayIndex(data.lastClaimTime);
		if (today <= lastDay) {
			// Already claimed today (or clock skew) — nothing to grant.
			return undefined;
		}

		// The streak continues only if the last claim was exactly the day before.
		const streak = data.lastClaimTime > 0 && today - lastDay === 1 ? data.streak + 1 : 1;
		const amount = getDailyReward(streak);

		addBalance(userId, amount);
		recordDailyRewardClaim(userId, os.time(), streak);

		this.analyticsService.logCurrencyGranted(
			player,
			Currency.Money,
			amount,
			getPlayerBalanceData(userId)?.money ?? amount,
			{ transactionType: Enum.AnalyticsEconomyTransactionType.TimedReward },
		);

		this.logger.Info(`Player ${userId} claimed daily reward ${amount} (streak ${streak})`);
		return { amount, streak };
	}

	/** Days since the Unix epoch (UTC) for a given time. */
	private dayIndex(time: number): number {
		return math.floor(time / DAY_SECONDS);
	}
}
