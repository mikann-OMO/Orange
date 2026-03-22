<script lang="ts">
import type { LIGHT_DARK_MODE } from "@/types/config.ts";
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";

let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);

function getDisplayMode(): LIGHT_DARK_MODE {
	const storedTheme = getStoredTheme();
	if (storedTheme === LIGHT_MODE) return LIGHT_MODE;
	if (storedTheme === DARK_MODE) return DARK_MODE;
	// AUTO_MODE: 根据系统主题决定显示
	if (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		return DARK_MODE;
	}
	return LIGHT_MODE;
}

onMount(() => {
	mode = getDisplayMode();

	// 监听系统主题变化
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleChange = () => {
		if (getStoredTheme() === AUTO_MODE) {
			mode = mediaQuery.matches ? DARK_MODE : LIGHT_MODE;
		}
	};
	mediaQuery.addEventListener("change", handleChange);

	return () => mediaQuery.removeEventListener("change", handleChange);
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	// 直接在日间和夜间模式之间切换
	switchScheme(mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE);
}
</script>

<button aria-label="Light/Dark Mode" role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme}>
    <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== LIGHT_MODE} class:scale-0={mode !== LIGHT_MODE}>
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
    </div>
    <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== DARK_MODE} class:scale-0={mode !== DARK_MODE}>
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
    </div>
</button>
