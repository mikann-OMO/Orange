<script lang="ts">
import type { LIGHT_DARK_MODE } from "@/types/config";
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import Icon from "@iconify/svelte";
import { getStoredTheme, setTheme } from "@utils/setting-utils";
import { onMount, tick } from "svelte";

let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);

function getDisplayMode(): LIGHT_DARK_MODE {
	const storedTheme = getStoredTheme();
	if (storedTheme === LIGHT_MODE) return LIGHT_MODE;
	if (storedTheme === DARK_MODE) return DARK_MODE;
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

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleChange = () => {
		if (getStoredTheme() === AUTO_MODE) {
			requestAnimationFrame(() => {
				mode = mediaQuery.matches ? DARK_MODE : LIGHT_MODE;
			});
		}
	};
	mediaQuery.addEventListener("change", handleChange);

	return () => mediaQuery.removeEventListener("change", handleChange);
});

async function switchScheme(newMode: LIGHT_DARK_MODE) {
	try {
		await tick();
		mode = newMode;
		setTheme(newMode);
	} catch (e) {
		console.warn("Theme switch aborted:", e);
	}
}

async function toggleScheme() {
	try {
		await switchScheme(mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE);
	} catch (e) {
		console.warn("Theme toggle aborted:", e);
	}
}
</script>

<button 
	aria-label="Light/Dark Mode" 
	role="menuitem" 
	class="scheme-switch-btn relative flex items-center justify-center rounded-lg h-11 w-11 active:scale-90 transition-transform"
	id="scheme-switch" 
	onclick={toggleScheme}
	tabindex="0"
>
    <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== LIGHT_MODE} class:scale-0={mode !== LIGHT_MODE}>
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] text-orange-700 dark:text-orange-400"></Icon>
    </div>
    <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== DARK_MODE} class:scale-0={mode !== DARK_MODE}>
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] text-orange-700 dark:text-orange-400"></Icon>
    </div>
</button>

<style>
	/* 移除按钮的默认 focus 样式 */
	.scheme-switch-btn:focus {
		outline: none;
	}
</style>
