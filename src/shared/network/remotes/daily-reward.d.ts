export interface DailyRewardClientToServerEvents {
	/**
	 * Requests to claim today's daily reward. The result (granted currency and
	 * new streak) is observed by the client through the synced store, so there is
	 * no server → client event.
	 */
	claim: () => void;
}
