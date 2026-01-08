export function formatDateToYYYYMMDD(date: Date): string {
	// 添加类型检查，确保传入的是有效的日期对象
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		throw new Error("Invalid date object");
	}
	// 使用更高效的方式格式化日期，避免创建临时字符串
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
	// 添加类型检查，确保传入的是有效的日期对象
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		throw new Error("Invalid date object");
	}
	// 直接使用模板字符串格式化日期，避免多次字符串替换
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year} ${month} ${day} ${hours} ${minutes}`;
}
