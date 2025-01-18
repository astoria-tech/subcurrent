import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import RSSParser from "rss-parser";

const parser = new RSSParser();
const BATCH_SIZE = 10; // Process 10 posts at a time

export async function POST(request: Request) {
  try {
    console.log("Starting feed registration process...");

    const { url, authorName } = await request.json();
    console.log(`Received feed submission: ${url} by ${authorName}`);

    // Insert the feed into the database
    const feed = await prisma.feed.create({
      data: { url, authorName },
    });
    console.log(`Feed registered in the database with ID: ${feed.id}`);

    // Fetch RSS feed data
    console.log(`Fetching RSS feed from URL: ${url}`);
    const parsedFeed = await parser.parseURL(url);
    console.log(`Fetched feed successfully: ${parsedFeed.title}`);

    // Calculate the start date for the last calendar year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    console.log(`Filtering posts published after: ${oneYearAgo.toISOString()}`);

    // Filter posts from the last year and limit to 100 posts
    const recentPosts = parsedFeed.items
      .filter((item) => {
        const pubDate = new Date(item.pubDate);
        const isRecent = pubDate >= oneYearAgo;
        if (!isRecent) {
          console.log(
            `Skipping post: ${item.title} - Published on: ${pubDate}`
          );
        }
        return isRecent;
      })
      .slice(0, 100); // Limit to 100 posts

    console.log(`Number of recent posts found: ${recentPosts.length}`);

    // Handle feeds without recent posts
    if (recentPosts.length === 0) {
      console.log("No posts found from the last year.");
      return NextResponse.json({
        message: "Feed added, but no posts found from the last year",
      });
    }

    // Process posts in batches
    console.log("Starting to process posts in batches...");
    for (let i = 0; i < recentPosts.length; i += BATCH_SIZE) {
      const batch = recentPosts.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch: ${Math.ceil(i / BATCH_SIZE) + 1}`);

      for (const item of batch) {
        console.log(`Inserting/updating post: ${item.title}`);
        await prisma.post.upsert({
          where: { link: item.link },
          update: {},
          create: {
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            snippet: item.contentSnippet || "",
            feedId: feed.id,
          },
        });
        console.log(`Post processed: ${item.title}`);
      }
    }

    console.log("All posts processed successfully.");
    return NextResponse.json({
      message: `Feed added and ${recentPosts.length} posts populated successfully`,
    });
  } catch (error) {
    console.error("Error adding feed and populating posts:", error);
    return NextResponse.json(
      { message: "Failed to add feed and populate posts" },
      { status: 500 }
    );
  }
}
