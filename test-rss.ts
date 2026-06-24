import { getFriendLatestPosts } from "./src/utils/friend-rss.ts";

console.log("开始抓取友链最新文章...\n");

const posts = await getFriendLatestPosts(10);

console.log(`成功抓取 ${posts.length} 篇文章：\n`);

posts.forEach((post, index) => {
	console.log(`${index + 1}. ${post.title}`);
	console.log(`   作者: ${post.friendlyName}`);
	console.log(`   链接: ${post.url}`);
	console.log(`   时间: ${post.date}\n`);
});