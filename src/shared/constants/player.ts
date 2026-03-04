import { Players } from "@rbxts/services";

const localPlayer = Players.LocalPlayer as Player | undefined;

/** The player's ID as a string, or `0` if it's required by the server. */
export const USER_ID = localPlayer ? tostring(localPlayer.UserId) : "0";
/** The player's name as a string, or `(server)` if it's required by the server. */
export const USER_NAME = localPlayer ? localPlayer.Name : "(server)";
