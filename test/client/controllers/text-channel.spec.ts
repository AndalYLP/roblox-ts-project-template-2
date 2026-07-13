import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { TextChannelController } from "client/controllers/text-channel";
import { setPlayerChatTag } from "shared/store/atoms/player/chat-tag";

import { fakePlayer, makeLogger, resetPlayerAtoms } from "../support/stubs";

interface TextChannelInternals {
	formatTag(tag: string, color: Color3, extra: string): string;
	onPlayerMessage(
		player: Player,
		message: TextChatMessage,
		properties: TextChatMessageProperties,
	): void;
}

const RED = Color3.fromRGB(255, 0, 0);

describe("TextChannelController", () => {
	let controller: TextChannelController;
	let internals: TextChannelInternals;

	beforeEach(() => {
		resetPlayerAtoms();
		controller = new TextChannelController(makeLogger().logger);
		internals = controller as unknown as TextChannelInternals;
	});

	describe("formatTag", () => {
		it("wraps the tag in a colored font prefix", () => {
			expect(internals.formatTag("Dev", RED, "hello")).toBe(
				"<font color='#ff0000'>[Dev] hello</font>",
			);
		});
	});

	describe("onPlayerMessage", () => {
		it("prefixes the message when the player has a chat tag", () => {
			setPlayerChatTag("1", { name: "Dev", color: RED });

			const properties = { PrefixText: "" } as TextChatMessageProperties;
			internals.onPlayerMessage(
				fakePlayer(1),
				{ PrefixText: "hi" } as TextChatMessage,
				properties,
			);

			expect(properties.PrefixText).toBe("<font color='#ff0000'>[Dev] hi</font>");
		});

		it("leaves the prefix untouched when the player has no chat tag", () => {
			const properties = { PrefixText: "" } as TextChatMessageProperties;
			internals.onPlayerMessage(
				fakePlayer(2),
				{ PrefixText: "hi" } as TextChatMessage,
				properties,
			);

			expect(properties.PrefixText).toBe("");
		});
	});
});
