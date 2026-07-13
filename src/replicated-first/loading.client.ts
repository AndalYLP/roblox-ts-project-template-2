// Runs from ReplicatedFirst, before the rest of the client. Its only job is to
// remove the default loading screen and show a plain cover, bridging the gap
// until `client/ui/loading` mounts the real Vide loading screen on top and
// removes this cover.
//
// This must stay self-contained: importing any module would pull in the
// roblox-ts runtime library, which is not guaranteed to have replicated this
// early — so use only Roblox globals here.

const ReplicatedFirst = game.GetService("ReplicatedFirst");
const Players = game.GetService("Players");

ReplicatedFirst.RemoveDefaultLoadingScreen();

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

const cover = new Instance("ScreenGui");
cover.Name = "LoadingCover";
cover.IgnoreGuiInset = true;
// One below the Vide loading screen so it sits underneath until removed.
cover.DisplayOrder = 999_999;
cover.ResetOnSpawn = false;

const background = new Instance("Frame");
background.Size = UDim2.fromScale(1, 1);
background.BackgroundColor3 = Color3.fromRGB(15, 15, 20);
background.BorderSizePixel = 0;
background.Parent = cover;

cover.Parent = playerGui;
