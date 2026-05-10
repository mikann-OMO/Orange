type Runtime = {
	isMobile: boolean;
	bannerEnabled: boolean;
	backToTopBtn: HTMLElement | null;
	navbar: HTMLElement | null;
	lastScrollY: number;
	scrollScheduled: boolean;
	onPageLoad: () => void;
};

const w = window as any;

function createRuntime(): Runtime {
	const rt: Runtime = {
		isMobile: false,
		bannerEnabled: false,
		backToTopBtn: null,
		navbar: null,
		lastScrollY: 0,
		scrollScheduled: false,
		onPageLoad: () => {},
	};

	const panelConfigs: Record<string, string[]> = {
		"display-setting": ["display-setting", "display-settings-switch"],
		"nav-menu-panel": ["nav-menu-panel", "nav-menu-switch"],
	};

	const refreshBasics = () => {
		rt.isMobile = window.innerWidth <= 768;
		rt.bannerEnabled = !!document.getElementById("banner-wrapper");
		rt.navbar = document.getElementById("navbar-wrapper");
		rt.backToTopBtn = document.getElementById("back-to-top-btn");

		document.body.style.overflow = "auto";

		if (rt.navbar) {
			const navbarHeight = rt.navbar.getBoundingClientRect().height;
			const tocOffset = Math.max(72, Math.round(navbarHeight) + 12);
			document.documentElement.style.setProperty(
				"--toc-offset",
				`${tocOffset}px`,
			);
		}
	};

	const updateScroll = () => {
		const y = window.scrollY;
		rt.lastScrollY = y;

		if (rt.backToTopBtn) {
			if (y > 200) {
				rt.backToTopBtn.classList.add("visible");
			} else {
				rt.backToTopBtn.classList.remove("visible");
			}
		}
	};

	const scheduleScrollUpdate = () => {
		if (rt.scrollScheduled) return;
		rt.scrollScheduled = true;
		requestAnimationFrame(() => {
			rt.scrollScheduled = false;
			updateScroll();
		});
	};

	const onResize = () => {
		refreshBasics();
		scheduleScrollUpdate();
	};

	const onScroll = () => scheduleScrollUpdate();

	const onDocumentClick = (event: MouseEvent) => {
		if (rt.isMobile) return;
		const target = event.target;
		if (!(target instanceof Node)) return;

		for (const [panelId, ignoreIds] of Object.entries(panelConfigs)) {
			const panel = document.getElementById(panelId);
			if (!panel) continue;

			let isInsideIgnored = false;
			for (const ignoreId of ignoreIds) {
				const ignoreEl = document.getElementById(ignoreId);
				if (ignoreEl && (ignoreEl === target || ignoreEl.contains(target))) {
					isInsideIgnored = true;
					break;
				}
			}

			if (!isInsideIgnored) {
				panel.classList.add("float-panel-closed");
			}
		}
	};

	const bindNavMenuSwitch = () => {
		const navMenuSwitch = document.getElementById("nav-menu-switch");
		const navMenuPanel = document.getElementById("nav-menu-panel");
		if (!navMenuSwitch || !navMenuPanel) return;

		if (navMenuSwitch.dataset.bound === "true") return;
		navMenuSwitch.dataset.bound = "true";

		navMenuSwitch.addEventListener(
			"click",
			(e) => {
				e.stopPropagation();
				navMenuPanel.classList.toggle("float-panel-closed");
			},
			{ passive: true },
		);
	};

	const bindBackToTop = () => {
		const btn = document.getElementById("back-to-top-inner-btn");
		if (!btn || btn.dataset.bound === "true") return;
		btn.dataset.bound = "true";

		const backToTop = () => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		};

		btn.addEventListener("click", (e) => {
			e.preventDefault();
			backToTop();
		});

		btn.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				backToTop();
			}
		});
	};

	rt.onPageLoad = () => {
		refreshBasics();
		bindNavMenuSwitch();
		bindBackToTop();
		scheduleScrollUpdate();
	};

	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onResize, { passive: true });
	document.addEventListener("click", onDocumentClick);

	document.addEventListener("astro:page-load", rt.onPageLoad);
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", rt.onPageLoad, {
			once: true,
		});
	} else {
		rt.onPageLoad();
	}

	return rt;
}

w.__layoutRuntime = w.__layoutRuntime || createRuntime();
w.__layoutRuntime.onPageLoad();
