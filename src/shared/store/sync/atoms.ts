import { datastore } from "shared/store/atoms/datastore";
import { flattenAtoms } from "utils/charm/flatten-atoms";

export type GlobalAtoms = typeof atoms;

export const atoms = flattenAtoms({
	datastore
})