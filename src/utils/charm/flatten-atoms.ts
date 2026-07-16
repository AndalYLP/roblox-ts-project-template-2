/**
 * A flat map of atoms keyed by name. Charm Sync exported this as `AtomMap` until
 * 0.4, which no longer does, so it lives here now.
 *
 * Constrained by the atom's *getter* shape rather than `Atom<unknown>`, and that
 * is deliberate: an atom both gets and sets, so its type parameter also sits in
 * a contravariant position (`(update: Update<T>) => T`), which makes `Atom<T>`
 * invariant — `Atom<number>` is not assignable to `Atom<unknown>`. A return type
 * is covariant, so matching only the readable half accepts every atom. Charm
 * Sync constrains its own `ServerSignalMap` the same way.
 *
 * This only bounds the shape; `flattenAtoms` still infers and preserves each
 * atom's precise type.
 */
type AtomMap = Record<string, () => unknown>;

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
