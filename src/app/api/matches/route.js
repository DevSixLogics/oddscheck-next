import { getMatchesByLocalDate, flattenMatches } from "@/lib/api";
import { todayInZone } from "@/lib/format";

// Always fetch fresh — this powers client-side live polling.
export const dynamic = "force-dynamic";

/** GET /api/matches?sport=football[&date=YYYY-MM-DD] → { matches: [...] }
 *  Grouped by the viewer's LOCAL day (from the `timezone` cookie), matching the
 *  SSR listings; `date` defaults to local-today. */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sport = (searchParams.get("sport") || "football").toLowerCase();
  const tz = request.cookies.get("timezone")?.value || "UTC";
  const date = searchParams.get("date") || todayInZone(tz);
  try {
    // fresh: bypass the 60s data cache so live polling sees current scores/minutes.
    const { groups } = await getMatchesByLocalDate(sport, date, tz, { fresh: true });
    const matches = flattenMatches(groups).map((m) => ({ ...m, sport }));
    return Response.json({ matches });
  } catch {
    return Response.json({ matches: [] });
  }
}
