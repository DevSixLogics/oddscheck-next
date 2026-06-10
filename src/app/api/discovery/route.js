import { NextResponse } from "next/server";
import { scanArbitrage, scanValue, scanMiddles, scanBoosts } from "@/lib/discovery";

export const dynamic = "force-dynamic";

// GET /api/discovery?type=arb|ev|middle|boosts → live opportunities for that tool.
export async function GET(request) {
  const type = request.nextUrl.searchParams.get("type") || "arb";
  let items = [];
  try {
    if (type === "arb") items = await scanArbitrage();
    else if (type === "ev") items = await scanValue();
    else if (type === "middle") items = await scanMiddles();
    else if (type === "boosts") items = await scanBoosts();
  } catch (err) {
    console.error("[api] discovery scan failed:", err.message);
  }
  return NextResponse.json({ type, items });
}
