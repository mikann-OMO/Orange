(function () {
	const w = window as any;
	if (w.__vtHooksInstalled) return;
	w.__vtHooksInstalled = true;

	function triggerEnterAnimations() {
		const mainContent = document.querySelector(".main-panel");
		if (mainContent) {
			mainContent.classList.add("page-enter-animation");
			mainContent.addEventListener(
				"animationend",
				() => {
					mainContent.classList.remove("page-enter-animation");
				},
				{ once: true },
			);
		}

		if (window.innerWidth <= 768) return;

		const cards = document.querySelectorAll(
			".post-card-animate, .friend-card-animate, .note-card-animate",
		);
		if (cards.length === 0) return;

		const cardObserver = new IntersectionObserver(
			(entries) => {
				let index = 0;
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const idx = index;
						setTimeout(() => {
							entry.target.classList.add("card-enter");
							(entry.target as HTMLElement).addEventListener(
								"animationend",
								() => {
									entry.target.classList.remove("card-enter");
								},
								{ once: true },
							);
						}, idx * 15);
						cardObserver.unobserve(entry.target);
					}
					index++;
				}
			},
			{ threshold: 0.05, rootMargin: "50px" },
		);

		const limit = Math.min(cards.length, 10);
		for (let i = 0; i < limit; i++) {
			cardObserver.observe(cards[i]);
		}

		const postContent = document.querySelector(".post-content-animate");
		if (postContent) {
			postContent.classList.add("content-enter");
			(postContent as HTMLElement).addEventListener(
				"animationend",
				() => {
					postContent.classList.remove("content-enter");
				},
				{ once: true },
			);
		}

		const sidebar = document.querySelector("#sidebar-sticky");
		if (sidebar) {
			sidebar.classList.add("sidebar-enter");
			(sidebar as HTMLElement).addEventListener(
				"animationend",
				() => {
					sidebar.classList.remove("sidebar-enter");
				},
				{ once: true },
			);
		}
	}

	document.addEventListener("astro:page-load", () => {
		requestAnimationFrame(triggerEnterAnimations);
		requestAnimationFrame(() => {
			document.body.style.overflow = "auto";
			document.documentElement.style.overflowY = "auto";
			document.body.style.position = "static";
			document.documentElement.style.position = "static";
		});
	});
})();
