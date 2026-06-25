<script lang="ts">
	type RecentUpdate = {
		title: string;
		url: string;
		date: string;
		platform: string;
		description: string;
	};

	let updates = $state<RecentUpdate[]>([]);
	let loading = $state(true);
	let error = $state("");
	let refreshedAt = $state("");

	async function loadUpdates() {
		loading = true;
		error = "";
		try {
			const res = await fetch("/api/recent-updates", { cache: "no-store" });
			if (!res.ok) throw new Error("加载失败");
			const data = await res.json();
			updates = Array.isArray(data.updates) ? data.updates : [];
			refreshedAt = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
		} catch {
			error = "暂时无法获取最近更新";
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadUpdates();
		const timer = window.setInterval(loadUpdates, 5 * 60 * 1000);
		return () => window.clearInterval(timer);
	});
</script>

<div class="p-4">
	{#if loading && updates.length === 0}
		<div class="text-center py-10 text-orange-950/50 dark:text-white/50">
			<div class="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-orange-500/30 border-t-orange-600 animate-spin"></div>
			<p>正在获取最近更新...</p>
		</div>
	{:else if error && updates.length === 0}
		<div class="text-center py-10 text-orange-950/50 dark:text-white/50">
			<p>{error}</p>
			<button
				type="button"
				onclick={loadUpdates}
				class="mt-3 px-3 py-1.5 rounded-lg bg-orange-200/60 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300 text-sm"
			>
				重试
			</button>
		</div>
	{:else if updates.length > 0}
		<div class="flex items-center justify-between mb-3 text-[0.6875rem] text-orange-950/40 dark:text-white/40">
			<span>{refreshedAt ? `更新于 ${refreshedAt}` : "实时更新"}</span>
			<button type="button" onclick={loadUpdates} class="hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
				刷新
			</button>
		</div>
		<div class="space-y-3">
			{#each updates as update}
				<a
					href={update.url}
					target="_blank"
					rel="noopener noreferrer"
					class="group flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 dark:bg-stone-700/30 hover:bg-orange-100/80 dark:hover:bg-stone-700/50 transition-all duration-200 border border-transparent hover:border-orange-300/50 dark:hover:border-orange-500/20"
				>
					<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm">
						{update.platform.slice(0, 1)}
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1">
							<span class="inline-flex items-center px-2 py-0.5 rounded text-[0.6875rem] font-medium bg-orange-200/50 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300">
								{update.platform}
							</span>
						</div>
						<p class="font-bold text-orange-700 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors line-clamp-2">{update.title}</p>
						{#if update.description}
							<p class="text-[0.6875rem] text-orange-950/50 dark:text-white/50 mt-1 line-clamp-2">{update.description}</p>
						{/if}
						<p class="text-[0.6875rem] text-orange-950/40 dark:text-white/40 mt-1.5">
							{new Date(update.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
						</p>
					</div>
					<span class="text-[0.75rem] text-orange-950/20 dark:text-white/20 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1">↗</span>
				</a>
			{/each}
		</div>
	{:else}
		<div class="text-center py-10 text-orange-950/50 dark:text-white/50">
			<p>暂无内容</p>
		</div>
	{/if}
</div>
