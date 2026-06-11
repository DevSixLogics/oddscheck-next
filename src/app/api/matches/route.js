import { getMatches, flattenMatches } from "@/lib/api";

// Always fetch fresh — this powers client-side live polling.
export const dynamic = "force-dynamic";

/** GET /api/matches?sport=football[&date=YYYY-MM-DD] → { matches: [...] } */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sport = (searchParams.get("sport") || "football").toLowerCase();
  const date = searchParams.get("date") || undefined;
  try {
    const { groups } = await getMatches(sport, date);
    const matches = flattenMatches(groups).map((m) => ({ ...m, sport }));
    return Response.json({ matches });
  } catch {
    return Response.json({ matches: [] });
  }
}
