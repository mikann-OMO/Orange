import type { APIRoute } from 'astro';

// 内存存储作为fallback
let fallbackLikes = 0;
// 检查是否使用fallback（默认使用fallback）
let useFallback = true;
let kv: any;

try {
  const { kv: vercelKv } = await import('@vercel/kv');
  kv = vercelKv;
  // 尝试获取一个值来测试KV是否配置正确
  await kv.get('test');
  useFallback = false;
  console.log('Using Vercel KV for likes');
} catch (error) {
  // 本地开发时使用内存存储作为fallback
  useFallback = true;
  console.log('Using fallback storage for likes (local development)');
}

export const prerender = false;

export const GET: APIRoute = async () => {
  let count = 0;
  
  if (useFallback) {
    count = fallbackLikes;
  } else {
    try {
      count = await kv.get('total_likes') || 0;
    } catch (error) {
      console.error('Error getting likes from KV:', error);
      count = 0;
    }
  }
  
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const hasLiked = cookies.get('has_liked');
  
  if (hasLiked) {
    return new Response(JSON.stringify({ message: '你已经点过赞啦！' }), { status: 400 });
  }

  let newCount = 0;
  
  if (useFallback) {
    newCount = ++fallbackLikes;
  } else {
    try {
      newCount = await kv.incr('total_likes');
    } catch (error) {
      console.error('Error incrementing likes in KV:', error);
      // 出错时使用fallback
      newCount = ++fallbackLikes;
    }
  }
  
  // 设置cookie
  cookies.set('has_liked', 'true', {
    path: '/',
    maxAge: 31536000,
    httpOnly: true,
  });
  
  const response = new Response(JSON.stringify({ count: newCount }), {
    headers: { 'Content-Type': 'application/json' }
  });

  return response;
};