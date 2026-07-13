_G.__CI__ = false;
_G.__VERBOSE__ = true;

const ReplicatedStorage = game.GetService("ReplicatedStorage");
const ServerScriptService = game.GetService("ServerScriptService");
const StarterPlayerScripts = game
	.GetService("StarterPlayer")
	.WaitForChild("StarterPlayerScripts") as StarterPlayerScripts;
const TestService = game.GetService("TestService");
const { runCLI } = require(ReplicatedStorage.rbxts_include.node_modules["@rbxts"].jest.src);

const config = require(TestService["jest.config"]);

const [success, result] = runCLI(script, config, [
	ServerScriptService.TS.__test__!,
	ReplicatedStorage.TS.__test__!,
	StarterPlayerScripts.TS.__test__!,
]).await();

if (!success) {
	throw `Failed to run test: ${result}`;
}
