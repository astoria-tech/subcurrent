import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import RSSParser from "rss-parser";

const parser = new RSSParser({
  customFields: {
    item: ["media:group"], // Include media:group for parsing (e.g., for YouTube feeds)
  },
});

// Helper function to extract snippet or fallback to a default
function getSnippet(item: any): string {
  const mediaDescription = item["media:group"]?.["media:description"];
  const description = Array.isArray(mediaDescription)
    ? mediaDescription[0]
    : mediaDescription;
  return item.contentSnippet || description || "No description available.";
}

export async function POST(request: Request) {
  try {
    const { url, authorName } = await request.json();
    console.log(`Received feed submission: ${url} by ${authorName}`);

    // Insert the feed into the database
    const feed = await prisma.feed.create({
      data: { url, authorName },
    });
    console.log(`Feed registered in the database with ID: ${feed.id}`);

    // Fetch the RSS/Atom feed
    console.log(`Fetching RSS feed from URL: ${url}`);
    const parsedFeed = await parser.parseURL(url);
    console.log(`Fetched feed successfully: ${parsedFeed.title}`);

    // Filter posts from the last calendar year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentPosts = parsedFeed.items
      .filter((item) => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (!pubDate || pubDate < oneYearAgo) {
          console.log(`Skipping old or invalid post: ${item.title}`);
          return false;
        }
        return true;
      })
      .slice(0, 100); // Limit to 100 posts

    console.log(`Number of recent posts found: ${recentPosts.length}`);

    if (recentPosts.length === 0) {
      return NextResponse.json({
        message: "Feed added, but no posts found from the last year",
      });
    }

    // Process each post and store it in the database
    for (const item of recentPosts) {
      console.log("Processing item:", item);

      const fullSnippet = getSnippet(item);
      console.log("Full snippet:", fullSnippet);

      await prisma.post.upsert({
        where: { link: item.link },
        update: {},
        create: {
          title: item.title,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(), // Fallback for invalid dates
          snippet: fullSnippet,
          feedId: feed.id,
        },
      });
      console.log(`Post processed: ${item.title}`);
    }

    console.log("All posts processed successfully.");
    return NextResponse.json({
      message: `Feed added and ${recentPosts.length} posts populated successfully`,
    });
  } catch (error) {
    console.error("Error registering feed:", error);

    return NextResponse.json(
      {
        message: "Failed to register feed",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
