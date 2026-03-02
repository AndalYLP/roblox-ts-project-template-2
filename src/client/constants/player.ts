import { Players } from "@rbxts/services";

export const { LocalPlayer: LOCAL_PLAYER } = Players;

/** The player's GUI instance. */
export const PLAYER_GUI = LOCAL_PLAYER.FindFirstChildWhichIsA("PlayerGui")!;
