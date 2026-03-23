import type { LIGHT_DARK_MODE } from "@/types/config";
import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants";

export function applyThemeToDocument(theme: LIGHT_DARK_MODE): void {
	// 使用 requestAnimationFrame 来批量处理主题切换，减少重绘和回流
	requestAnimationFrame(() => {
		switch (theme) {
			case LIGHT_MODE:
				document.documentElement.classList.remove("dark");
				break;
			case DARK_MODE:
				document.documentElement.classList.add("dark");
				break;
			case AUTO_MODE:
				// Auto mode: check system preference
				if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
				break;
		}

		// 触发主题变化事件
		const event = new CustomEvent("themeChange", { detail: { theme } });
		window.dispatchEvent(event);
	});
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	// 先存储主题，再应用
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
