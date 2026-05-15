<script lang="ts">
	const { iso, full } = $props<{ iso: string; full: string }>();

	let relative = $state("");
	const date = new Date(iso);

	function update(): void {
		const diffMs = Date.now() - date.getTime();
		const diffSecs = Math.floor(diffMs / 1000);
		const diffMins = Math.floor(diffSecs / 60);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffSecs < 60) {
			relative = "刚刚";
		} else if (diffMins < 60) {
			relative = `${diffMins}分钟前`;
		} else if (diffHours < 24) {
			relative = `${diffHours}小时前`;
		} else if (diffDays < 7) {
			relative = `${diffDays}天前`;
		} else {
			relative = date.toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
		}
	}

	$effect(() => {
		update();
		const interval = setInterval(update, 60000);
		return () => clearInterval(interval);
	});
</script>

<span title={full}>{relative}</span>
