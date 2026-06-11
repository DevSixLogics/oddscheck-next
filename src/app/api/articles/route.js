import { NextResponse } from "next/server";
import { getArticlesForCategory } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/articles?category=<name> → articles for that category.
// Powers the on-click category fetch on the reviews/articles page.
export async function GET(request) {
  const category = request.nextUrl.searchParams.get("category") || "All";
  const articles = await getArticlesForCategory(category);
  return NextResponse.json({ category, articles });
}
