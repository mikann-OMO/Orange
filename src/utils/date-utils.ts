import { siteConfig } from "../config";

// 缓存格式化器，避免重复创建
type FormatterCache = Map<string, Intl.DateTimeFormat>;
const formatters: FormatterCache = new Map();

// 获取缓存的格式化器
function getFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
	// 将下划线格式转换为连字符格式（如 zh_CN → zh-CN），因为 Intl.DateTimeFormat 只接受连字符格式
	const normalizedLocale = locale.replace(/_/g, "-");
	const key = `${normalizedLocale}-${JSON.stringify(options)}`;
	let formatter = formatters.get(key);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(normalizedLocale, options);
		formatters.set(key, formatter);
	}
	return formatter;
}

export function formatDateToYYYYMMDD(date: Date): string {
	// 使用 ISO 格式获取 YYYY-MM-DD，性能更好
	return date.toISOString().slice(0, 10);
}

export function formatDate(
	date: Date,
	lang: string = siteConfig.lang || "en",
): string {
	// 根据语言选择合适的日期格式
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};

	// 使用缓存的格式化器，提高性能
	const formatter = getFormatter(lang, options);
	return formatter.format(date).replace(/[\/:]/g, " ");
}

// 仅格式化日期部分
export function formatDateOnly(
	date: Date,
	lang: string = siteConfig.lang || "en",
): string {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	const formatter = getFormatter(lang, options);
	return formatter.format(date);
}
