import Link from "next/link";
import { getRaceRunners } from "@/lib/api";
import { kickoffTime, kickoffDate } from "@/lib/format";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { cmsSeo } from "@/lib/seo";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const id = sp?.id;
  const race = id ? await getRaceRunners(id) : null;
  if (!race) return { title: "Racecard" };
  // CMS /seo-settings (horseracing.match_detail.info) drives this; with no template
  // it falls back to the race name from the feed — no static copy.
  const cms = await cmsSeo({
    sport: "racing",
    kind: "detail",
    replacements: {
      RACE_NAME: race.nm || "",
      PLAYER_NAME: race.nm || "",
      COUNTRY_NAME: race.cnm || race.course || "",
      DATE: kickoffDate(race.st) || "",
    },
    canonicalPath: `/race?id=${id}`,
  });
  return cms || { title: race.nm || "Racecard", description: null, alternates: { canonical: `/race?id=${id}` } };
}

export default async function RacePage({ searchParams }) {
  const sp = await searchParams;
  const race = await getRaceRunners(sp?.id);

  if (!race) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Racecard not found</h1>
          <p className="sub" style={{ marginBottom: 24 }}>We couldn&apos;t load runners for this race.</p>
          <Link className="btn btn-primary btn-lg" href="/racing">Back to racing</Link>
        </div>
      </section>
    );
  }

  const runners = (race.runner || []).filter((r) => !r.non_r);
  const isResult = (race.st || "").toUpperCase() === "RESULT";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        name: race.nm || "Horse race",
        sport: "Horse racing",
        url: `${SITE_URL}/race?id=${sp?.id}`,
        eventStatus: "https://schema.org/EventScheduled",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Horse Racing", item: `${SITE_URL}/racing` },
          { "@type": "ListItem", position: 3, name: race.nm || "Racecard" },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <section style={{ padding: "28px 0 24px", background: "linear-gradient(180deg, rgba(255,142,0,0.04) 0%, transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <li><Link href="/">Home</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><Link href="/racing">Horse Racing</Link></li>
              <li className="sep" aria-hidden="true">/</li>
              <li><span className="current" aria-current="page">Racecard</span></li>
            </ol>
          </nav>
          <div className="flex gap-2 mb-3" style={{ marginTop: 12 }}>
            {race.st && <span className="chip chip-best">{kickoffTime(race.st) || race.st}</span>}
            {isResult && <span className="chip chip-muted">Result</span>}
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", lineHeight: 1.2, maxWidth: "28ch" }}>{race.nm}</h1>
          <div className="mute" style={{ fontSize: 13, marginTop: 8 }}>
            {[race.dis && `${race.dis}`, race.nor && `${race.nor} runners`, kickoffDate(race.st)].filter(Boolean).join(" · ")}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-scroll">
              <table className="dt dt-compact" style={{ minWidth: 620 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>{isResult ? "Pos" : "#"}</th>
                    <th>Horse</th>
                    <th>Jockey / Trainer</th>
                    <th className="text-center">Wgt</th>
                    <th className="text-center">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {runners.map((r, i) => (
                    <tr key={r.id}>
                      <td className="num"><b style={{ color: isResult && r.pos === 1 ? "var(--accent)" : "var(--text)" }}>{isResult ? r.pos : i + 1}</b></td>
                      <td>
                        <div className="flex items-center gap-2">
                          {r.surl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.surl} alt="" width={26} height={26} style={{ borderRadius: 5, objectFit: "contain", background: "var(--bg-2)", flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.nm}</div>
                            {r.ffg ? <div className="mute num" style={{ fontSize: 11 }}>Form {r.ffg}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td><div style={{ fontSize: 12 }}>{r.joc}</div><div className="mute" style={{ fontSize: 11 }}>{r.tra}</div></td>
                      <td className="text-center num" style={{ fontSize: 12 }}>{r.wei || "–"}</td>
                      <td className="text-center num" style={{ fontSize: 12 }}>{r.age}{r.sex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "12px 18px", fontSize: 11, color: "var(--text-mute)" }}>
              Runners from the racecard feed (jockey, trainer, weight, silks).
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Link className="btn btn-ghost btn-sm" href="/racing">← All meetings</Link>
          </div>
        </div>
      </section>
    </>
  );
}
