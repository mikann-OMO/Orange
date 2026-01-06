export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

export function formatDate(date: Date): string {
	return date
		.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			formatMatcher: "basic",
		})
		.replace(/\//g, " ")
		.replace(/:/g, " ");
}
