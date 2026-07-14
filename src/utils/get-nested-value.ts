/**
 * Reads a dot-delimited nested key (e.g. `"balance.money"`) off an object.
 *
 * @param object - The object to read from.
 * @param nestedKey - The dot-delimited path to the value.
 * @returns The value at that path (untyped — the caller should validate it).
 */
export function getNestedValue(object: object, nestedKey: string): unknown {
	let value: unknown = object;
	for (const key of nestedKey.split(".")) {
		value = (value as Record<string, unknown>)[key];
	}

	return value;
}
