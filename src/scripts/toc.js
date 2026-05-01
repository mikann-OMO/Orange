export function initToc() {
	const links = [...document.querySelectorAll(".toc a")];
	const headings = [
		...document.querySelectorAll(".markdown-content h1, h2, h3"),
	];

	if (!links.length || !headings.length) return;

	const linkMap = {};
	for (const l of links) {
		linkMap[l.dataset.id] = l;
	}

	const getOffset = () => {
		const nav = document.getElementById("navbar-wrapper");
		return nav ? nav.offsetHeight + 12 : 80;
	};

	// ===== 激活（含父级）=====
	const activate = (id) => {
		for (const l of links) {
			l.classList.remove("active");
		}

		let current = linkMap[id];
		while (current) {
			current.classList.add("active");

			const parentId = current.closest("ul")?.dataset.children;
			if (!parentId) break;

			current = linkMap[parentId];
		}
	};

	// ===== 自动展开 =====
	const expandPath = (id) => {
		let el = linkMap[id];
		while (el) {
			const parentId = el.closest("ul")?.dataset.children;
			if (!parentId) break;

			const ul = document.querySelector(`[data-children="${parentId}"]`);
			if (ul) ul.removeAttribute("data-collapsed");

			const toggle = document.querySelector(`[data-toggle="${parentId}"]`);
			if (toggle) toggle.classList.remove("collapsed");

			el = linkMap[parentId];
		}
	};

	// ===== scroll spy =====
	let activeId = "";

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const id = entry.target.id;
					if (id !== activeId) {
						activeId = id;
						activate(id);
						expandPath(id);
					}
				}
			}
		},
		{
			rootMargin: "0px 0px -70% 0px",
		},
	);

	for (const h of headings) {
		observer.observe(h);
	}

	// ===== 平滑滚动 =====
	for (const link of links) {
		link.addEventListener("click", (e) => {
			e.preventDefault();

			const id = link.dataset.id;
			const el = document.getElementById(id);
			if (!el) return;

			window.scrollTo({
				top: el.getBoundingClientRect().top + window.scrollY - getOffset(),
				behavior: "smooth",
			});

			history.replaceState(null, "", `#${id}`);
		});
	}

	// ===== 折叠功能 =====
	for (const btn of document.querySelectorAll("[data-toggle]")) {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();

			const id = btn.dataset.toggle;
			const ul = document.querySelector(`[data-children="${id}"]`);
			if (!ul) return;

			const collapsed = ul.hasAttribute("data-collapsed");

			if (collapsed) {
				ul.removeAttribute("data-collapsed");
				btn.classList.remove("collapsed");
			} else {
				ul.setAttribute("data-collapsed", "true");
				btn.classList.add("collapsed");
			}
		});
	}

	// ===== 初始化 hash =====
	const hash = location.hash.replace("#", "");
	if (hash && linkMap[hash]) {
		activate(hash);
		expandPath(hash);
	}
}
