import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { TextChannelService } from "server/services/text-channel";
import { DEVELOPERS } from "shared/constants/core";
import { getPlayerChatTagData, setPlayerChatTag } from "shared/store/atoms/player/chat-tag";
import type { PlayerEntity } from "server/services/player/entity";

import { makeLogger, makePlayerEntity, resetPlayerAtoms } from "./support/service-stubs";

// NOTE: Channel/instance methods (createChannel, getPlayersOnChannel, sendMessage)
// need real TextChatService instances and connected players, so only the
// data-driven join/leave chat-tag logic is unit-tested here.

const DEV_ID = tonumber(DEVELOPERS[0]) ?? 0;
const NON_DEV_ID = DEV_ID + 1;

describe("TextChannelService", () => {
	let service: TextChannelService;

	beforeEach(() => {
		resetPlayerAtoms();
		service = new TextChannelService(makeLogger().logger);
	});

	describe("onPlayerJoin", () => {
		it("assigns the developer chat tag to a developer", () => {
			const entity = makePlayerEntity(DEV_ID);

			service.onPlayerJoin(entity);

			expect(getPlayerChatTagData(tostring(DEV_ID))).toBe(service.chatTags.developer);
		});

		it("does not assign a chat tag to a non-developer", () => {
			const entity = makePlayerEntity(NON_DEV_ID);

			service.onPlayerJoin(entity);

			expect(getPlayerChatTagData(tostring(NON_DEV_ID))).toBeUndefined();
		});
	});

	describe("onPlayerLeave", () => {
		it("clears the player's chat tag", () => {
			const entity: PlayerEntity = makePlayerEntity(NON_DEV_ID);
			setPlayerChatTag(entity.userId, service.chatTags.developer);

			service.onPlayerLeave(entity);

			expect(getPlayerChatTagData(entity.userId)).toBeUndefined();
		});
	});
});
