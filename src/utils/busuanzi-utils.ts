let loadingPromise: Promise<void> | null = null;

function isLocalHost(hostname: string): boolean {
	return (
		hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
	);
}

export function shouldUseBusuanzi(): boolean {
	if (typeof window === "undefined") return false;
	return !isLocalHost(window.location.hostname);
}

export function ensureBusuanziLoaded(): Promise<void> {
	if (typeof window === "undefined") return Promise.resolve();
	if (typeof window.busuanzi?.fetch === "function") return Promise.resolve();
	if (loadingPromise) return loadingPromise;

	loadingPromise = new Promise((resolve) => {
		const existing = document.querySelector(
			'script[data-busuanzi="true"]',
		) as HTMLScriptElement | null;

		if (existing) {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener("error", () => resolve(), { once: true });
			return;
		}

		const script = document.createElement("script");
		script.dataset.busuanzi = "true";
		script.src =
			"https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
		script.async = true;
		script.defer = true;
		script.addEventListener("load", () => resolve(), { once: true });
		script.addEventListener("error", () => resolve(), { once: true });
		document.head.appendChild(script);
	});

	return loadingPromise;
}
