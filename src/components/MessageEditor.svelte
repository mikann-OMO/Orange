<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import { tick } from "svelte";

export let slug: string;
export let parentId: string | null;
export let isReply = false;
const dispatch = createEventDispatcher<{
	added: never;
}>();

let nickname = "";
let email = "";
let website = "";
let content = "";
let submitting = false;
let error = "";

onMount(() => {
	nickname = localStorage.getItem("message_nickname") || "";
	email = localStorage.getItem("message_email") || "";
	website = localStorage.getItem("message_website") || "";
});

function saveToStorage() {
	if (nickname) localStorage.setItem("message_nickname", nickname);
	if (email) localStorage.setItem("message_email", email);
	if (website) localStorage.setItem("message_website", website);
}

async function handleSubmit(e: Event) {
	e.preventDefault();
	submitting = true;
	error = "";

	try {
		const response = await fetch("/api/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				slug,
				content: content.trim(),
				nickname: nickname.trim(),
				email: email.trim(),
				website: website.trim() || null,
				parentId,
			}),
		});

		if (!response.ok) throw new Error("Failed to submit message");

		saveToStorage();
		content = "";
		await tick();
		dispatch("added");
	} catch (e) {
		error = "发送失败，请重试";
		console.warn("Message submit error:", e);
	} finally {
		submitting = false;
	}
}
</script>

<form on:submit={handleSubmit} class="message-editor space-y-4">
	{#if error}
		<div class="text-red-500 text-sm">{error}</div>
	{/if}

	{#if !isReply}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label for="nickname" class="block text-sm font-medium mb-1">昵称 *</label>
				<input
					id="nickname"
					type="text"
					bind:value={nickname}
					required
					placeholder="你的昵称"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="email" class="block text-sm font-medium mb-1">邮箱 *</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="your@email.com"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="website" class="block text-sm font-medium mb-1">网站（可选）</label>
				<input
					id="website"
					type="url"
					bind:value={website}
					placeholder="https://"
					class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
	{/if}

	<div>
		<label for="content" class="block text-sm font-medium mb-1">内容 *</label>
		<textarea
			id="content"
			bind:value={content}
			required
			placeholder={isReply ? "写点什么..." : "支持 Markdown 和 ||剧透|| 语法哦~"}
			rows={isReply ? 3 : 5}
			class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
		></textarea>
	</div>

	<div class="flex items-center justify-between">
		{#if !isReply}
			<span class="text-xs text-gray-500">支持简单的 Markdown 语法</span>
		{/if}
		<button
			type="submit"
			disabled={submitting}
			class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{submitting ? "发送中..." : "发送"}
		</button>
	</div>
</form>
