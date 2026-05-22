export function formatDateToYYYYMMDD(date: Date): string {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		throw new Error("Invalid date object");
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		throw new Error("Invalid date object");
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year} ${month} ${day}`;
}
