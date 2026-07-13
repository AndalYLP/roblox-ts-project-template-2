import { atom } from "@rbxts/charm";
import { describe, expect, it } from "@rbxts/jest-globals";

import { flattenAtoms } from "utils/charm/flatten-atoms";

describe("flattenAtoms", () => {
	it("prefixes each atom key with its group name", () => {
		const groupA = { x: atom(0), y: atom(1) };
		const groupB = { z: atom(2) };

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

		let count = 0;
		for (const [_key] of pairs(flattened)) {
			count += 1;
		}

		expect(count).toBe(3);
	});

	it("returns an empty map when given no atoms", () => {
		const flattened = flattenAtoms({ empty: {} }) as Record<string, unknown>;

		let count = 0;
		for (const [_key] of pairs(flattened)) {
			count += 1;
		}

		expect(count).toBe(0);
	});
});
