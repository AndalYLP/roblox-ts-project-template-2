/**
 * Shared spacing scale for the UI, expressed in unscaled pixels. Wrap each value
 * in `px(...)` at the call site so it scales with the viewport.
 *
 * Keeping these in one place keeps margins, gaps, and padding consistent across
 * every UI surface — change a value here and it updates everywhere.
 */
export const SPACING = {
	/** Gap between stacked items in a list (toasts, setting rows). */
	gap: 8,
	/** Inner padding for panels and cards. */
	padding: 16,
	/** Distance anchored UI keeps from the screen edges. */
	screenMargin: 16,
} as const;
