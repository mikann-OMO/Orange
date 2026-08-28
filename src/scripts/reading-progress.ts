(function () {
	const w = window as any;
	if (w.__readingProgressInstalled) return;
	w.__readingProgressInstalled = true;

	const bar = document.getElementById("reading-progress");
	let docHeight = 0;
	let ticking = false;

	const calcDocHeight = () => {
		docHeight =
			document.documentElement.scrollHeight - window.innerHeight;
	};

	const update = () => {
		ticking = false;
		const scrollTop = window.scrollY;
		const progress = docHeight > 0 ? scrollTop / docHeight : 0;
		if (bar) {
			bar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
		}
	};

	const requestTick = () => {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(update);
		}
	};

	window.addEventListener("scroll", requestTick, { passive: true });
	window.addEventListener("resize", () => {
		calcDocHeight();
		requestTick();
	}, { passive: true });

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			calcDocHeight();
			update();
		});
	} else {
		calcDocHeight();
		update();
	}
})();
