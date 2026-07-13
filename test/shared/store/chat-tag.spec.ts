import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import {
	deletePlayerTagData,
	getPlayerChatTagData,
	setPlayerChatTag,
} from "shared/store/atoms/player/chat-tag";

import { resetPlayerAtoms } from "../support/make-player-data";

const USER = "1";
const TAG = { name: "Dev", color: Color3.fromRGB(56, 179, 224) };

// The chat-tag atom lives in its own `playersAtom.chatTag` slice, independent of
// the datastore, so these tests don't need to seed base player data.
describe("chat-tag atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
	});

	it("returns undefined when no tag is set", () => {
		expect(getPlayerChatTagData(USER)).toBeUndefined();
	});

	it("stores and retrieves a chat tag", () => {
		setPlayerChatTag(USER, TAG);

		expect(getPlayerChatTagData(USER)).toBe(TAG);
	});

	it("removes a chat tag on delete", () => {
		setPlayerChatTag(USER, TAG);

		deletePlayerTagData(USER);

		expect(getPlayerChatTagData(USER)).toBeUndefined();
	});

	it("keeps each user's tag isolated", () => {
		const other = { name: "VIP", color: Color3.fromRGB(255, 215, 0) };
		setPlayerChatTag("1", TAG);
		setPlayerChatTag("2", other);

		expect(getPlayerChatTagData("1")).toBe(TAG);
		expect(getPlayerChatTagData("2")).toBe(other);
	});
});
