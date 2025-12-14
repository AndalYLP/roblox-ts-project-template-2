import { datastore } from "shared/store/atoms/player/datastore";
import { flattenAtoms } from "utils/charm/flatten-atoms";

export type GlobalAtoms = typeof atoms;

export const atoms = flattenAtoms({
	datastore
})