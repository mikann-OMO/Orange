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
			mode = mediaQuery.matches ? DARK_MODE : LIGHT_MODE;
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
	class="scheme-switch-btn"
	id="scheme-switch" 
	onclick={toggleScheme}
	tabindex="0"
>
    <div class="scheme-icon scheme-icon-light" class:opacity-0={mode !== LIGHT_MODE} class:scale-0={mode !== LIGHT_MODE}>
        <Icon icon="material-symbols:wb-sunny-outline-rounded" class="scheme-icon-svg"></Icon>
    </div>
    <div class="scheme-icon scheme-icon-dark" class:opacity-0={mode !== DARK_MODE} class:scale-0={mode !== DARK_MODE}>
        <Icon icon="material-symbols:dark-mode-outline-rounded" class="scheme-icon-svg"></Icon>
    </div>
</button>

<style>
	.scheme-switch-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		width: 2.75rem;
		height: 2.75rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.scheme-switch-btn:hover {
		background: var(--surface-hover);
	}

	.scheme-switch-btn:active {
		transform: scale(0.9);
	}

	.scheme-switch-btn:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.scheme-icon {
		position: absolute;
		transition: all 0.3s ease-in-out;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scheme-icon-svg {
		font-size: 1.25rem;
		color: var(--accent-text);
	}
</style>
