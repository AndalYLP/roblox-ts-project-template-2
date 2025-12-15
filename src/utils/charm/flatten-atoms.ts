import type { AtomMap } from "@rbxts/charm-sync";

type NestedAtomMap = {
	readonly [K in string]: AtomMap;
};

type Flattened<T extends NestedAtomMap> = UnionToIntersection<
	{
		[P in keyof T]: {
			[K in Extract<keyof T[P], string> as `${Extract<P, string>}/${K}`]: T[P][K];
		};
	}[keyof T]
>;

type FlattenNestedAtoms<T extends NestedAtomMap> = {
	[K in keyof Flattened<T>]: Flattened<T>[K];
};

/**
 * Assigns unique prefixes to each atom and flattens them into a single map.
 * Should be passed to Charm's Sync API.
 *
 * @param maps The maps of atoms to flatten.
 * @returns The flattened map of atoms.
 */
export function flattenAtoms<T extends NestedAtomMap>(maps: T): FlattenNestedAtoms<T>;

export function flattenAtoms(maps: NestedAtomMap): FlattenNestedAtoms<NestedAtomMap> {
	const flattened = {} as Writable<FlattenNestedAtoms<NestedAtomMap>>;

	for (const [prefix, map] of pairs(maps)) {
		for (const [key, atom] of pairs(map)) {
			flattened[`${prefix}/${key}`] = atom;
		}
	}

	return flattened;
}
