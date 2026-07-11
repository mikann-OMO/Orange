<script lang="ts">
	type FriendPost = {
		title: string;
		link: string;
		published: string;
		description: string;
		siteTitle: string;
		siteurl: string;
		avatar: string;
	};

	const { limit = 3 } = $props<{ limit?: number }>();

	let posts = $state<FriendPost[]>([]);
	let loading = $state(true);

	async function fetchPosts(): Promise<void> {
		try {
			const res = await fetch(`/api/friend-circle?t=${Date.now()}`);
			if (res.ok) {
				const data = await res.json();
				posts = (data.items || []).slice(0, limit);
			}
		} catch (e) {
			console.error("Failed to fetch friend posts:", e);
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	function handleImageError(e: Event): void {
		const img = e.currentTarget as HTMLImageElement;
		img.style.display = "none";
	}

	$effect(() => {
		const timer = setTimeout(() => {
			fetchPosts();
		}, 1000);
		return () => clearTimeout(timer);
	});
</script>

<div>
	{#if loading}
		<div class="space-y-3">
			{#each Array(limit) as _}
				<div class="group flex items-start gap-2 p-2 rounded-lg bg-orange-50/50 dark:bg-stone-700/30">
					<div class="w-8 h-8 rounded-lg bg-orange-200/50 dark:bg-stone-600/50 flex-shrink-0 mt-0.5 animate-pulse"></div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-1 mb-1">
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.625rem] font-medium bg-orange-200/50 dark:bg-orange-800/30 text-orange-700/50 dark:text-orange-300/50 animate-pulse"></span>
						</div>
						<p class="font-bold text-orange-700/30 dark:text-white/30 text-xs line-clamp-2 h-7 animate-pulse">...</p>
						<p class="text-[0.625rem] text-orange-950/20 dark:text-white/20 mt-0.5 flex items-center gap-1">
							<span class="w-3 h-3 bg-orange-200/50 dark:bg-stone-600/50 rounded animate-pulse"></span>
							<span class="animate-pulse">...</span>
						</p>
					</div>
				</div>
			{/each}
		</div>
	{:else if posts.length > 0}
		<div class="space-y-3">
			{#each posts as post}
				<a
					href={post.link}
					target="_blank"
					rel="noopener noreferrer"
					class="group flex items-start gap-2 p-2 rounded-lg bg-orange-50/50 dark:bg-stone-700/30 hover:bg-orange-100/80 dark:hover:bg-stone-700/50 transition-all duration-200"
				>
					<img
						src={post.avatar}
						alt={post.siteTitle}
						class="w-8 h-8 rounded-lg object-cover flex-shrink-0 mt-0.5"
						loading="lazy"
						onerror={handleImageError}
					/>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-1 mb-1">
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.625rem] font-medium bg-orange-200/50 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300">
								{post.siteTitle}
							</span>
						</div>
						<p class="font-bold text-orange-700 dark:text-white text-xs group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors line-clamp-2">{post.title}</p>
						<p class="text-[0.625rem] text-orange-950/40 dark:text-white/40 mt-0.5 flex items-center gap-1">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
							{formatDate(post.published)}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="text-center py-4 text-orange-950/50 dark:text-white/50">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-2xl mb-1 opacity-50">
				<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
			</svg>
			<p class="text-sm">暂无内容</p>
		</div>
	{/if}
</div>
