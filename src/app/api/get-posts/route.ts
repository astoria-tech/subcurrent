import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { feed: true },
    orderBy: { pubDate: "desc" },
  });

  return NextResponse.json(posts);
}
