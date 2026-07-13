import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";

import { setPlayerData } from "shared/store/atoms/player/atom";
import {
	addDeveloperProductPurchase,
	getGamePassActive,
	getPlayerMtxData,
	setGamePassActive,
	updateReceiptHistory,
} from "shared/store/atoms/player/mtx";
import type { GamePass, Product } from "types/enums/mtx";

import { makePlayerData, resetPlayerAtoms } from "../support/make-player-data";

const USER = "1";
const PASS = "1" as GamePass;
const PRODUCT = "3" as Product;

describe("mtx atom", () => {
	beforeEach(() => {
		resetPlayerAtoms();
		setPlayerData(USER, makePlayerData());
	});

	describe("game passes", () => {
		it("returns undefined when the pass has never been set", () => {
			expect(getGamePassActive(USER, PASS)).toBeUndefined();
		});

		it("marks a game pass active", () => {
			setGamePassActive(USER, PASS, true);

			expect(getGamePassActive(USER, PASS)).toBe(true);
		});

		it("can toggle a game pass back to inactive", () => {
			setGamePassActive(USER, PASS, true);
			setGamePassActive(USER, PASS, false);

			expect(getGamePassActive(USER, PASS)).toBe(false);
		});
	});

	describe("developer products", () => {
		it("records the first purchase with a count of one", () => {
			addDeveloperProductPurchase(USER, PRODUCT, 100);

			const productData = getPlayerMtxData(USER)?.products.get(PRODUCT);
			expect(productData?.timesPurchased).toBe(1);
			expect(productData?.purchaseInfo.size()).toBe(1);
			expect(productData?.purchaseInfo[0].purchasePrice).toBe(100);
		});

		it("increments the count and appends history on repeat purchases", () => {
			addDeveloperProductPurchase(USER, PRODUCT, 100);
			addDeveloperProductPurchase(USER, PRODUCT, 250);

			const productData = getPlayerMtxData(USER)?.products.get(PRODUCT);
			expect(productData?.timesPurchased).toBe(2);
			expect(productData?.purchaseInfo.size()).toBe(2);
			expect(productData?.purchaseInfo[1].purchasePrice).toBe(250);
		});
	});

	describe("receipt history", () => {
		it("overwrites the receipt history with the provided list", () => {
			updateReceiptHistory(USER, ["a", "b"]);
			expect(getPlayerMtxData(USER)?.receiptHistory).toEqual(["a", "b"]);

			updateReceiptHistory(USER, ["c"]);
			expect(getPlayerMtxData(USER)?.receiptHistory).toEqual(["c"]);
		});
	});

	it("does nothing for a user with no loaded data", () => {
		resetPlayerAtoms();

		setGamePassActive(USER, PASS, true);
		addDeveloperProductPurchase(USER, PRODUCT, 100);

		expect(getPlayerMtxData(USER)).toBeUndefined();
	});
});
