(function () {
	const w = window as any;
	if (w.__enterAnimInstalled) return;
	w.__enterAnimInstalled = true;

	function triggerEnterAnimations() {
		// 卡片级联入场（仅桌面端，移动端直接展示避免性能开销）
		if (window.innerWidth > 768) {
			const cards = document.querySelectorAll(
				".post-card-animate, .friend-card-animate, .note-card-animate",
			);
			if (cards.length > 0) {
				const cardObserver = new IntersectionObserver(
					(entries) => {
						const visible = entries.filter((e) => e.isIntersecting);
						if (visible.length === 0) return;

						requestAnimationFrame(() => {
							visible.forEach((entry, i) => {
								const el = entry.target as HTMLElement;
								el.style.setProperty("--card-delay", `${i * 60}ms`);
								el.classList.add("card-enter");
								el.addEventListener(
									"animationend",
									() => {
										el.classList.remove("card-enter");
										el.style.removeProperty("--card-delay");
									},
									{ once: true },
								);
								cardObserver.unobserve(el);
							});
						});
					},
					{ threshold: 0.05, rootMargin: "50px" },
				);

				const limit = Math.min(cards.length, 10);
				for (let i = 0; i < limit; i++) {
					cardObserver.observe(cards[i]);
				}
			}
		}

		// 文章内容与侧栏淡入
		const postContent = document.querySelector(".post-content-animate");
		if (postContent) {
			postContent.classList.add("content-enter");
			(postContent as HTMLElement).addEventListener(
				"animationend",
				() => postContent.classList.remove("content-enter"),
				{ once: true },
			);
		}

		const sidebar = document.querySelector("#sidebar-sticky");
		if (sidebar) {
			sidebar.classList.add("sidebar-enter");
			(sidebar as HTMLElement).addEventListener(
				"animationend",
				() => sidebar.classList.remove("sidebar-enter"),
				{ once: true },
			);
		}
	}

	document.addEventListener("astro:page-load", () => {
		requestAnimationFrame(triggerEnterAnimations);
	});
})();
