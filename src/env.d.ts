/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare global {
	interface Window {
		busuanzi?: {
			fetch: () => void;
		};
		__navbarRuntime?: {
			menuOpen: boolean;
			installed: boolean;
		};
		__layoutRuntime?: {
			onPageLoad: () => void;
		};
		__vtHooksInstalled?: boolean;
		__pageProgressInstalled?: boolean;
		__photoswipeInstalled?: boolean;
		__mdCopyInstalled?: boolean;
	}
}

export {};
