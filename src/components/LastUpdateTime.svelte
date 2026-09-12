<script lang="ts">
	import { formatDateOrToday, formatDateToYYYYMMDD } from "../utils/date-utils";

	const { iso } = $props<{ iso: string }>();

	const date = $derived(new Date(iso));
	let display = $state("");

	function update(): void {
		display = formatDateOrToday(date);
	}

	$effect(() => {
		update();
		const interval = setInterval(update, 60000);
		return () => clearInterval(interval);
	});
</script>

<span title={formatDateToYYYYMMDD(date)}>{display}</span>
