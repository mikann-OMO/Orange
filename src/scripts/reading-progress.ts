(function () {
	const w = window as any;
	if (w.__readingProgressInstalled) return;
	w.__readingProgressInstalled = true;

	const update = () => {
		const scrollTop = window.scrollY;
		const docHeight =
			document.documentElement.scrollHeight - window.innerHeight;
		const progress = docHeight > 0 ? scrollTop / docHeight : 0;
		const bar = document.getElementById("reading-progress");
		if (bar) {
			bar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
		}
	};

	window.addEventListener("scroll", update, { passive: true });
	window.addEventListener("resize", update, { passive: true });

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", update);
	} else {
		update();
	}
})();
