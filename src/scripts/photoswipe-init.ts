import type PhotoSwipeLightbox from "photoswipe/lightbox";
import type { PhotoSwipeOptions, SlideData } from "photoswipe";

(function () {
	const w = window as any;
	if (w.__photoswipeInstalled) return;
	w.__photoswipeInstalled = true;

	let lightbox: PhotoSwipeLightbox | null = null;

	const hasGalleryItems = () =>
		!!document.querySelector(
			".gallery a, .custom-md img, #post-cover img, #post-cover-mobile img",
		);

	async function initPhotoSwipe() {
		if (!hasGalleryItems()) {
			if (lightbox) {
				lightbox.destroy();
				lightbox = null;
			}
			return;
		}

		if (lightbox) {
			lightbox.destroy();
			lightbox = null;
		}

		try {
			if (!document.querySelector('link[href="/photoswipe.css"]')) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = "/photoswipe.css";
				document.head.appendChild(link);
			}

			const { default: PLB } = await import("photoswipe/lightbox");
			const { default: PS } = await import("photoswipe");

			const options: PhotoSwipeOptions = {
				gallery:
					".gallery a, .custom-md img, #post-cover img, #post-cover-mobile img",
				pswpModule: PS,
				closeSVG:
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>',
				zoomSVG:
					'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M340-540h-40q-17 0-28.5-11.5T260-580q0-17 11.5-28.5T300-620h40v-40q0-17 11.5-28.5T380-700q17 0 28.5 11.5T420-660v40h40q17 0 28.5 11.5T500-580q0 17-11.5 28.5T460-540h-40v40q0 17-11.5 28.5T380-460q-17 0-28.5-11.5T340-500v-40Zm40 220q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>',
				padding: { top: 40, bottom: 40, left: 40, right: 40 },
				wheelToZoom: true,
				arrowPrev: true,
				arrowNext: true,
				imageClickAction: false,
				bgClickAction: "close",
				tapAction: "toggle-controls",
				doubleTapAction: "zoom",
			};

			lightbox = new PLB(options);

			lightbox.addFilter(
				"domItemData",
				(itemData: SlideData, element: HTMLElement) => {
					if (element.tagName === "A") {
						const href = element.getAttribute("href") || "";
						const pswpWidth = element.getAttribute("data-pswp-width");
						const pswpHeight = element.getAttribute("data-pswp-height");

						itemData.src = href;
						itemData.msrc = href;

						if (pswpWidth && pswpHeight) {
							itemData.w = Number.parseInt(pswpWidth, 10);
							itemData.h = Number.parseInt(pswpHeight, 10);
						} else {
							const img = element.querySelector("img");
							if (img) {
								itemData.w = Number(
									img.naturalWidth || img.width || 800,
								);
								itemData.h = Number(
									img.naturalHeight || img.height || 600,
								);
							} else {
								itemData.w = 800;
								itemData.h = 600;
							}
						}
					} else if (element instanceof HTMLImageElement) {
						itemData.src = element.src;
						itemData.w = Number(
							element.naturalWidth || element.width || 800,
						);
						itemData.h = Number(
							element.naturalHeight || element.height || 600,
						);
						itemData.msrc = element.src;
					}
					return itemData;
				},
			);

			lightbox.init();
		} catch (_error) {
			/* ignore */
		}
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					initPhotoSwipe();
					observer.disconnect();
					break;
				}
			}
		},
		{ rootMargin: "500px" },
	);

	const boot = () => {
		const gallery = document.querySelector(
			".gallery, .custom-md, #post-cover, #post-cover-mobile",
		);
		if (gallery) {
			observer.observe(gallery);
		} else {
			requestAnimationFrame(initPhotoSwipe);
		}
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot, { once: true });
	} else {
		boot();
	}

	document.addEventListener("astro:page-load", boot);
})();
