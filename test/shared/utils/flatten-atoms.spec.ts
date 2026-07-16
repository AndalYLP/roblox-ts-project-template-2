import { atom } from "@rbxts/charm";
import { describe, expect, it } from "@rbxts/jest-globals";

import { flattenAtoms } from "utils/charm/flatten-atoms";

/** Counts the keys of a plain object (no `.size()` on Luau tables). */
function keyCount(object: Record<string, unknown>): number {
	let count = 0;
	for (const [_key] of pairs(object)) {
		count += 1;
	}

	return count;
}

describe("flattenAtoms", () => {
	it("prefixes each atom key with its group name", () => {
		const groupA = { x: atom(0), y: atom(0) };
		const groupB = { z: atom(0) };

		const flattened = flattenAtoms({ groupA, groupB }) as Record<string, unknown>;

		expect(flattened["groupA/x"]).toBe(groupA.x);
		expect(flattened["groupA/y"]).toBe(groupA.y);
		expect(flattened["groupB/z"]).toBe(groupB.z);
	});

	it("produces one flattened key per source atom", () => {
		const flattened = flattenAtoms({
			one: { a: atom(0) },
			two: { b: atom(0), c: atom(0) },
		}) as Record<string, unknown>;

		expect(keyCount(flattened)).toBe(3);
	});

	it("returns an empty map when given no atoms", () => {
		const flattened = flattenAtoms({}) as Record<string, unknown>;

		expect(keyCount(flattened)).toBe(0);
	});
});
