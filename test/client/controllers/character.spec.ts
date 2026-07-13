import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { CharacterController } from "client/controllers/player/character";
import type { CharacterRig } from "utils/player";

import { makeLogger } from "../support/stubs";

interface CharacterInternals {
	currentCharacter?: CharacterRig;
	onRigLoaded(rig: CharacterRig): void;
	removeCharacter(): void;
}

/** A rig stub — the lifecycle methods only pass it through, never touch it. */
function fakeRig(): CharacterRig {
	return {} as unknown as CharacterRig;
}

describe("CharacterController", () => {
	let controller: CharacterController;
	let internals: CharacterInternals;

	beforeEach(() => {
		controller = new CharacterController(makeLogger().logger);
		internals = controller as unknown as CharacterInternals;
	});

	it("has no current character before a rig loads", () => {
		expect(controller.getCurrentCharacter()).toBeUndefined();
	});

	it("stores the rig and fires onCharacterAdded when a rig loads", () => {
		const rig = fakeRig();
		let received: CharacterRig | undefined;
		controller.onCharacterAdded.Connect((loaded) => {
			received = loaded;
		});

		internals.onRigLoaded(rig);

		expect(controller.getCurrentCharacter()).toBe(rig);
		expect(received).toBe(rig);
	});

	it("clears the current character on removal", () => {
		internals.onRigLoaded(fakeRig());

		internals.removeCharacter();

		expect(controller.getCurrentCharacter()).toBeUndefined();
	});
});
