/**
 * Reads a dot-delimited nested key (e.g. `"balance.money"`) off an object.
 *
 * The path is checked against `T` at compile time, so every segment is
 * guaranteed to resolve — a typo is a compile error at the call site rather than
 * an "attempt to index nil" in here.
 *
 * @param object - The object to read from.
 * @param nestedKey - The dot-delimited path to the value.
 * @returns The value at that path (untyped — the caller should validate it).
 */
export function getNestedValue<T extends object>(
	object: T,
	nestedKey: NestedKeyOf<T> & string,
): unknown {
	let value: unknown = object;
	for (const key of nestedKey.split(".")) {
		value = (value as Record<string, unknown>)[key];
	}

	return value;
}
