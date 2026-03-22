export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Blog Comments API</h1>
      <p>API endpoints:</p>
      <ul>
        <li><code>GET /api/comments?postSlug=xxx</code> - Get comments for a post</li>
        <li><code>POST /api/comments</code> - Create a new comment</li>
        <li><code>POST /api/comments/like</code> - Like/unlike a comment</li>
        <li><code>GET /api/comments/count?postSlug=xxx</code> - Get comment count</li>
      </ul>
    </main>
  )
}
