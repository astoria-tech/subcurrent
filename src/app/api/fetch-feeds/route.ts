import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import RSSParser from "rss-parser";

const parser = new RSSParser();

export async function POST() {
  const feeds = await prisma.feed.findMany({ where: { approved: true } });

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items) {
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
      }
    } catch (error) {
      console.error(`Failed to fetch feed: ${feed.url}`, error);
    }
  }

  return NextResponse.json({ message: "Feeds updated successfully" });
}
