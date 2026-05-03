import type { LIGHT_DARK_MODE } from "@/types/config";
import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants";

export function applyThemeToDocument(theme: LIGHT_DARK_MODE): void {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	const isDark = document.documentElement.classList.contains("dark");
	document.documentElement.style.setProperty(
		"--page-bg",
		isDark ? "#1c1917" : "#faf8f5",
	);

	const event = new CustomEvent("themeChange", { detail: { theme } });
	window.dispatchEvent(event);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	// 先存储主题，再应用
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
