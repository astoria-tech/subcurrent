import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import RSSParser from "rss-parser";

const parser = new RSSParser({
  customFields: {
    item: ["media:group"], // Include media:group for parsing (e.g., for YouTube feeds)
  },
});

// Helper function to extract snippet
function getSnippet(item: any): string {
  const mediaDescription = item["media:group"]?.["media:description"];
  const description = Array.isArray(mediaDescription)
    ? mediaDescription[0] // Use the first element if it's an array
    : mediaDescription;
  return item.contentSnippet || description || "No description available.";
}

export async function POST() {
  try {
    console.log("Starting update for all approved feeds...");
    const feeds = await prisma.feed.findMany({ where: { approved: true } });

    for (const feed of feeds) {
      console.log(`Fetching posts for feed: ${feed.url}`);
      const parsedFeed = await parser.parseURL(feed.url);

      const recentPosts = parsedFeed.items.slice(0, 100); // Limit to 100 posts

      for (const item of recentPosts) {
        const fullSnippet = getSnippet(item);
        console.log(`Processing post: ${item.title}`);
        console.log(`Snippet: ${fullSnippet}`);

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
      }
      console.log(`Finished updating feed: ${feed.url}`);
    }

    console.log("All feeds updated successfully.");
    return NextResponse.json({ message: "All feeds updated successfully" });
  } catch (error) {
    console.error("Error updating feeds:", error);
    return NextResponse.json(
      {
        message: "Failed to update feeds",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
