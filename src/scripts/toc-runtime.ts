interface TocRuntimeOptions {
	containerSelector?: string;
	contentSelector?: string;
	tocRootSelector?: string;
}

function isInViewport(el: HTMLElement): boolean {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

export function initToc(options: TocRuntimeOptions = {}) {
	const {
		containerSelector = "aside#toc, #sidebar-toc-wrapper",
		contentSelector = ".markdown-content",
		tocRootSelector = "[data-toc-root]",
	} = options;

	const allContainers = document.querySelectorAll(containerSelector);
	const tocRoot = document.querySelector(tocRootSelector);

	if (allContainers.length === 0 && !tocRoot) return;

	const getOffset = (): number => {
		const nav = document.getElementById("navbar-wrapper");
		const h = nav ? nav.getBoundingClientRect().height : 0;
		return Math.max(72, Math.round(h) + 12);
	};

	// Active class names
	const activeClass = ["bg-orange-950/5", "dark:bg-white/10"];

	// Clear all active states
	const clearActive = () => {
		for (const n of document.querySelectorAll("[data-toc-id]")) {
			n.classList.remove(...activeClass);
			n.removeAttribute("data-active");
		}
	};

	// Activate a TOC item and its parents
	const activate = (id: string) => {
		if (!id) return;

		clearActive();

		const current = document.querySelector(
			`[data-toc-id="${id}"]`,
		) as HTMLElement | null;

		if (!current) return;

		current.classList.add(...activeClass);
		current.setAttribute("data-active", "true");

		// Auto-expand parents
		let parentId = current.getAttribute("data-parent-id");
		while (parentId) {
			const parent = document.querySelector(
				`[data-children-for="${parentId}"]`,
			) as HTMLElement | null;
			if (parent) {
				parent.removeAttribute("data-collapsed");
				const parentToggle = document.querySelector(
					`[data-toggle-for="${parentId}"] .toc-toggle-icon`,
				);
				if (parentToggle) {
					(parentToggle as HTMLElement).style.transform = "rotate(0deg)";
				}
			}

			const parentLink = document.querySelector(
				`[data-toc-id="${parentId}"]`,
			) as HTMLElement | null;
			if (parentLink) {
				parentLink.classList.add(...activeClass);
				parentLink.setAttribute("data-active", "true");
			}
			parentId = parentLink?.getAttribute("data-parent-id") || null;
		}

		// Scroll into view only if not in viewport (avoids jitter)
		if (!isInViewport(current)) {
			current.scrollIntoView({
				block: "center",
				behavior: "smooth",
			});
		}
	};

	// Setup smooth scroll for TOC links only
	const setupSmoothScroll = () => {
		for (const a of document.querySelectorAll("[data-toc-id]")) {
			a.addEventListener("click", (e) => {
				e.preventDefault();
				const id = a.getAttribute("data-toc-id");
				if (!id) return;

				const el = document.getElementById(id) as HTMLElement | null;
				if (!el) return;

				const top =
					window.scrollY + el.getBoundingClientRect().top - getOffset();

				window.scrollTo({ top, behavior: "smooth" });
				history.replaceState(null, "", `#${id}`);
			});
		}
	};

	// Setup IntersectionObserver for scroll spy
	const setupScrollSpy = () => {
		const content = document.querySelector(contentSelector);
		if (!content) return;

		const headings = content.querySelectorAll("h1, h2, h3, h4");
		if (headings.length === 0) return;

		const io = new IntersectionObserver(
			(entries) => {
				for (const en of entries) {
					if (en.isIntersecting) {
						activate(en.target.id);
					}
				}
			},
			{
				rootMargin: "0px 0px -70% 0px",
				threshold: 0,
			},
		);

		for (const h of headings) {
			io.observe(h);
		}
	};

	// Setup toggle collapse/expand
	const setupToggle = () => {
		for (const btn of document.querySelectorAll("[data-toggle-for]")) {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				e.preventDefault();

				const id = btn.getAttribute("data-toggle-for");
				if (!id) return;

				const children = document.querySelector(
					`[data-children-for="${id}"]`,
				) as HTMLElement | null;

				if (!children) return;

				const isCollapsed = children.hasAttribute("data-collapsed");
				if (isCollapsed) {
					children.removeAttribute("data-collapsed");
				} else {
					children.setAttribute("data-collapsed", "true");
				}

				const icon = btn.querySelector(
					".toc-toggle-icon",
				) as HTMLElement | null;
				if (icon) {
					icon.style.transform = isCollapsed
						? "rotate(0deg)"
						: "rotate(180deg)";
				}
			});
		}
	};

	// Set TOC offset CSS variable
	const setTocOffset = () => {
		const off = getOffset();
		document.documentElement.style.setProperty("--toc-offset", `${off}px`);
	};

	// Initialize everything
	const boot = () => {
		setTocOffset();
		window.addEventListener("resize", setTocOffset, { passive: true });
		setupSmoothScroll();
		setupScrollSpy();
		setupToggle();
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
}

// Mobile TOC specific helpers
export function initMobileToc() {
	const toggleBtn = document.getElementById("mobile-toc-toggle");
	const closeBtn = document.getElementById("mobile-toc-close");
	const panel = document.getElementById("mobile-toc-panel");

	if (!toggleBtn || !closeBtn || !panel) return;

	const openPanel = () => panel.classList.add("open");
	const closePanel = () => panel.classList.remove("open");

	toggleBtn.addEventListener("click", openPanel);
	closeBtn.addEventListener("click", closePanel);

	panel.addEventListener("click", (e) => {
		if (e.target === panel) closePanel();
	});

	for (const link of panel.querySelectorAll("a[data-toc-id]")) {
		link.addEventListener("click", closePanel);
	}
}
