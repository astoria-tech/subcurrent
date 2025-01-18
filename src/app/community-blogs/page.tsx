export const dynamic = "force-dynamic";

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-posts`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export default async function CommunityBlogs() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Astoria Tech Meetup | Subcurrent
      </h1>
      {posts.map((post: any) => (
        <div key={post.link} className="mb-6">
          <h3 className="text-lg font-semibold">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {post.title}
            </a>
          </h3>
          <p className="text-sm text-gray-700">
            {truncateText(post.snippet || "", 200)}
          </p>
          <p className="text-xs text-gray-500">
            By {post.feed.authorName} on{" "}
            {new Date(post.pubDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
