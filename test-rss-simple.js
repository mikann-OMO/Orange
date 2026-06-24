const friends = [
  { title: "橘智的安宁之地", siteurl: "https://juzhiart.com" },
  { title: "James", siteurl: "https://blog.james7.cn/zh-cn/feed.xml", rss: "https://blog.james7.cn/zh-cn/feed.xml" },
  { title: "时歌的博客", siteurl: "https://www.lapis.cafe/rss.xml", rss: "https://www.lapis.cafe/rss.xml" },
  { title: "白咲のblog", siteurl: "https://blog.shiro.team/rss.xml", rss: "https://blog.shiro.team/rss.xml" },
  { title: "𝙕𝙚𝙡𝙡𝙤𝙣", siteurl: "https://zellon.top/rss.xml", rss: "https://zellon.top/rss.xml" },
];

const FEED_PATHS = ["/feed.xml", "/rss.xml", "/atom.xml", "/feed", "/rss", "/feed/", "/atom/", "/index.xml"];

async function findValidFeed(siteUrl) {
  for (const path of FEED_PATHS) {
    try {
      const feedUrl = new URL(path, siteUrl).href;
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        if (text.includes("<rss") || text.includes("<feed")) {
          return feedUrl;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function testRSS() {
  console.log("开始测试 RSS 抓取...\n");

  for (const friend of friends) {
    console.log(`测试: ${friend.title}`);

    let feedUrl = friend.rss;
    if (!feedUrl) {
      feedUrl = await findValidFeed(friend.siteurl);
    }

    if (!feedUrl) {
      console.log(`  ❌ 未找到 RSS 地址\n`);
      continue;
    }

    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) {
        console.log(`  ❌ 请求失败: ${res.status}\n`);
        continue;
      }

      const xml = await res.text();
      const itemCount = (xml.match(/<item>/g) || xml.match(/<entry>/g) || []).length;
      console.log(`  ✅ 成功抓取: ${feedUrl}`);
      console.log(`  📄 文章数量: ${itemCount}\n`);
    } catch (error) {
      console.log(`  ❌ 错误: ${error.message}\n`);
    }
  }
}

testRSS();