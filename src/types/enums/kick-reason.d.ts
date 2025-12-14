/**
 * ### Enum that represents different kick codes related to player data.
 *
 * These codes are used to indicate the reason why a player was kicked.
 */
export declare enum KickCode {
	PlayerInstantiationError = "An error occurred while instantiating your player. Please rejoin the game.",
	// Player data related
	PlayerProfileUndefined = "Error loading player profile, please rejoin the game.",
}
