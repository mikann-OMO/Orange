export function encodePathSegment(value: string): string {
	if (!value) return "";

	return encodeURIComponent(value.trim());
}

export function decodePathSegment(value: string): string {
	if (!value) return "";

	try {
		return decodeURIComponent(value);
	} catch (e) {
		console.error(`Failed to decode path segment: ${value}`, e);
		return value;
	}
}
