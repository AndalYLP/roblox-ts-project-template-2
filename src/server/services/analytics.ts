import { Service } from "@flamework/core";
import { AnalyticsService as Analytics } from "@rbxts/services";
import type { Logger } from "@rbxts/log";

/** Extra key/value fields attached to an event (see `Enum.AnalyticsCustomFieldKeys`). */
export type CustomFields = Record<string, string>;

// NOTE: define before use.
/** Currencies tracked in economy events. Add the game's currencies here. */
export const Currency = {
	Money: "Money",
} as const;
export type Currency = ValueOf<typeof Currency>;

// NOTE: define before use.
/** Predefined custom event names. Add game-specific events here. */
export const CustomEvent = {
	ClaimedDailyReward: "ClaimedDailyReward",
	OpenedShop: "OpenedShop",
	UsedAbility: "UsedAbility",
} as const;
export type CustomEvent = ValueOf<typeof CustomEvent>;

/** A named progression funnel and its ordered steps. */
export interface FunnelDefinition {
	readonly name: string;
	readonly steps: ReadonlyArray<string>;
}

/**
 * Predefined funnels. Declare each funnel and its ordered steps once here, then
 * log them type-safely with {@link AnalyticsService.logFunnelStep}: the step
 * index is derived from its position, so there are no magic numbers or funnel
 * strings spread across the codebase.
 */
export const Funnels = {
	tutorial: {
		name: "Tutorial",
		steps: ["Started", "Moved", "OpenedInventory", "Completed"],
	},
} as const satisfies Record<string, FunnelDefinition>;

/**
 * Ordered steps of Roblox's built-in onboarding funnel (a player's first
 * session), logged with {@link AnalyticsService.logOnboardingStep}.
 */
export const ONBOARDING_STEPS = [
	"Joined",
	"DataLoaded",
	"CharacterSpawned",
	"FirstInteraction",
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface EconomyEventInfo {
	/** Amount of currency moved in the transaction. */
	amount: number;
	/** Which currency moved. */
	currency: Currency;
	customFields?: CustomFields;
	/** The player's balance *after* the transaction. */
	endingBalance: number;
	/** Whether currency flows in (`Source`) or out (`Sink`). */
	flowType: Enum.AnalyticsEconomyFlowType;
	/** Optional SKU of the item involved. */
	itemSku?: string;
	/** What kind of transaction this was. */
	transactionType: Enum.AnalyticsEconomyTransactionType;
}

export interface EconomyOptions {
	customFields?: CustomFields;
	itemSku?: string;
	/** Defaults to `Gameplay` for grants and `Shop` for spends. */
	transactionType?: Enum.AnalyticsEconomyTransactionType;
}

export interface FunnelStepOptions {
	customFields?: CustomFields;
	/** Groups steps into a single playthrough of the funnel. */
	sessionId?: string;
}

/**
 * Typed wrapper around Roblox's `AnalyticsService`, with a catalog of predefined
 * events ({@link Currency}, {@link CustomEvent}, {@link Funnels}) so callers
 * reference them by name instead of scattering raw strings. Every call is
 * wrapped in a `pcall` so a failed request never interrupts gameplay.
 *
 * @example
 *
 * ```
 * // Progression funnel — the step name is checked against the funnel's steps
 * this.analyticsService.logFunnelStep(player, Funnels.tutorial, "OpenedInventory");
 *
 * // Economy — a currency sink from a shop purchase
 * this.analyticsService.logCurrencySpent(player, Currency.Money, 100, balance.money, {
 * 	itemSku: "sword_01",
 * });
 *
 * // A predefined custom event
 * this.analyticsService.logCustomEvent(player, CustomEvent.ClaimedDailyReward);
 * ```
 */
@Service()
export class AnalyticsService {
	constructor(private readonly logger: Logger) {}

	/** Convenience: a currency `Source` (reward, refund, grant). */
	public logCurrencyGranted(
		player: Player,
		currency: Currency,
		amount: number,
		endingBalance: number,
		options: EconomyOptions = {},
	): void {
		this.logEconomyEvent(player, {
			amount,
			currency,
			customFields: options.customFields,
			endingBalance,
			flowType: Enum.AnalyticsEconomyFlowType.Source,
			itemSku: options.itemSku,
			transactionType:
				options.transactionType ?? Enum.AnalyticsEconomyTransactionType.Gameplay,
		});
	}

	/** Convenience: a currency `Sink` (purchase, spend). */
	public logCurrencySpent(
		player: Player,
		currency: Currency,
		amount: number,
		endingBalance: number,
		options: EconomyOptions = {},
	): void {
		this.logEconomyEvent(player, {
			amount,
			currency,
			customFields: options.customFields,
			endingBalance,
			flowType: Enum.AnalyticsEconomyFlowType.Sink,
			itemSku: options.itemSku,
			transactionType: options.transactionType ?? Enum.AnalyticsEconomyTransactionType.Shop,
		});
	}

	/** Logs a predefined {@link CustomEvent | custom event}. */
	public logCustomEvent(
		player: Player,
		event: CustomEvent,
		value?: number,
		customFields?: CustomFields,
	): void {
		this.safeLog(player, `custom '${event}'`, () => {
			Analytics.LogCustomEvent(player, event, value, customFields);
		});
	}

	/** Logs a raw economy source/sink event. */
	public logEconomyEvent(player: Player, info: EconomyEventInfo): void {
		this.safeLog(player, "economy", () => {
			Analytics.LogEconomyEvent(
				player,
				info.flowType,
				info.currency,
				info.amount,
				info.endingBalance,
				info.transactionType.Name,
				info.itemSku,
				info.customFields,
			);
		});
	}

	/** Logs a step of a predefined {@link Funnels | funnel}, keyed by step name. */
	public logFunnelStep<T extends FunnelDefinition>(
		player: Player,
		funnel: T,
		step: T["steps"][number],
		options: FunnelStepOptions = {},
	): void {
		const stepIndex = funnel.steps.indexOf(step) + 1;
		this.safeLog(player, `funnel '${funnel.name}'`, () => {
			Analytics.LogFunnelStepEvent(
				player,
				funnel.name,
				options.sessionId,
				stepIndex,
				step,
				options.customFields,
			);
		});
	}

	/** Logs a step of the built-in onboarding funnel, keyed by step name. */
	public logOnboardingStep(
		player: Player,
		step: OnboardingStep,
		customFields?: CustomFields,
	): void {
		const stepIndex = ONBOARDING_STEPS.indexOf(step) + 1;
		this.safeLog(player, "onboarding", () => {
			Analytics.LogOnboardingFunnelStepEvent(player, stepIndex, step, customFields);
		});
	}

	private safeLog(player: Player, kind: string, log: () => void): void {
		const [success, err] = pcall(log);
		if (!success) {
			this.logger.Warn(`Failed to log ${kind} event for ${player.UserId}: ${err}`);
		}
	}
}
