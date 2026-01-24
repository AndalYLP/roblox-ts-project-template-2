import { flattenAtoms } from "utils/charm/flatten-atoms";

import { datastore } from "shared/store/atoms/player/datastore";

export type GlobalAtoms = typeof atoms;

export const atoms = flattenAtoms({
	datastore,
});
