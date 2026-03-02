import { playersAtom } from "shared/store/atoms/player/atom";
import { flattenAtoms } from "utils/charm/flatten-atoms";

export type GlobalAtoms = typeof atoms;

export const atoms = flattenAtoms({
	playersAtom,
});
