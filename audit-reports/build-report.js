// SEO/GEO/AEO audit report builder for oddscheck-next.vercel.app
// Emits a polished DOCX (via the `docx` package) and a matching standalone HTML
// (which a separate Edge headless step converts to PDF). All content is driven
// from the `data` object so DOCX and HTML stay in sync.
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak,
} = require("docx");
const fs = require("fs");
const path = require("path");

const OUT = __dirname;
const DOMAIN = "oddscheck-next.vercel.app";
const DATE = "2026-06-19";
const FILEBASE = "seo-audit-oddscheck-next-vercel-app-2026-06-19";

// ── palette ────────────────────────────────────────────────────────────────
const C = {
  navy: "1B2A4A", blue: "2563EB", green: "16A34A", amber: "D97706", red: "DC2626",
  orange: "EA580C", grayRow: "F8F9FA", border: "E2E8F0", text: "1E293B",
  lightBlue: "EFF6FF", white: "FFFFFF", greenBg: "F0FDF4", muted: "94A3B8",
};
const scoreColor = (n) => (n >= 8 ? C.green : n >= 5 ? C.amber : C.red);
const statusFill = (s) =>
  ({ Good: C.green, "Needs Attention": C.amber, Missing: C.red }[s] || C.amber);

// ── audit data ───────────────────────────────────────────────────────────────
const data = {
  scores: { SEO: 7, GEO: 6, AEO: 5 },
  statusWord: { SEO: "On Track", GEO: "On Track", AEO: "Needs Work" },
  takeaway: {
    SEO: "Crawl block lifted — strong technical foundation now indexable; held back mainly by placeholder content.",
    GEO: "Entity schema strong and AI crawlers now unblocked; E-E-A-T still thin.",
    AEO: "Snippet-ready guide content, now crawlable — but still no FAQ/HowTo schema.",
  },
  summary:
    "OddsCheck-next is a technically accomplished Next.js build with a CMS-driven metadata system and rich, conditionally-constructed structured data (Organization, WebSite with SearchAction, CollectionPage/ItemList, BreadcrumbList, SportsEvent and NewsArticle) that is better engineered than most live production sites. The previously fatal sitewide crawl block has now been lifted: robots.txt serves \"User-agent: *\" with no Disallow plus a Sitemap line, so search and AI crawlers can reach the whole domain — this single change unlocks the strong foundation that was already in place. The remaining drag is content rather than engineering: the news feed is still lorem-ipsum, and the About and Contact pages are static placeholder components with no real company information. The highest-impact next steps are to replace that placeholder content, build out real author E-E-A-T, and layer FAQPage/HowTo schema onto the already snippet-ready guides.",
  pages: [
    ["/", "Homepage", "Rich content (~2k words), full Organization + WebSite JSON-LD, SearchAction. Strong."],
    ["/robots.txt", "Crawl directive", "RESOLVED: now 'User-agent: *' with no Disallow + Sitemap line. Full crawl access restored."],
    ["/sitemap.xml", "Sitemap index", "Well-structured index of 10 segmented sitemaps with lastmod. Good."],
    ["/about", "Company", "Placeholder component (~150 words). 'Static placeholder' note in build. No real bio."],
    ["/contact", "Contact", "Placeholder component. No NAP (name/address/phone) data exposed."],
    ["/news", "Blog index", "Lorem-ipsum article titles; author + date shown. 10 dummy articles, paginated."],
    ["/experts", "Authors/E-E-A-T", "Thin directory: names + job titles only, no real bios, credentials or photos."],
    ["/guides", "Guides hub", "24 guides, 6 categories, question-phrased headings. Title tag present. Strong."],
    ["/guide/[slug]", "Topic guide", "Excellent concise, question-led content — but NO JSON-LD schema at all."],
    ["/article/[slug]", "Article detail", "NewsArticle + BreadcrumbList schema with author/publisher. Good."],
    ["/football + sports", "Sport listings", "CollectionPage + BreadcrumbList + SportsEvent JSON-LD. CMS-driven meta."],
    ["/tools, /offers, /live", "Utility pages", "Present and linked; sitemap-listed. Content depth varies."],
  ],
  seo: {
    "Technical On-Page": [
      ["Title tag", "CMS-driven via layout template '%s | siteTitle'; per-page absolute titles on articles, guides and sports.", "Good"],
      ["Meta description", "Article/guide descriptions present. Sport listings set description:null (no fallback); homepage description inherits CMS /settings, which may be empty.", "Needs Attention"],
      ["Canonical tag", "Self-referencing canonical on every route via alternates.canonical resolved against metadataBase.", "Good"],
      ["Robots / indexability", "robots.txt now serves 'User-agent: *' with no Disallow plus a Sitemap line — full crawl access restored (previously blocked the whole site with Disallow:/). Indexable.", "Good"],
      ["Viewport / mobile", "Viewport configured with themeColor; responsive layout throughout.", "Good"],
      ["Heading hierarchy", "Single H1 per page with logical H2/H3. (Experts H1 is a long sentence — minor refinement.)", "Good"],
      ["Open Graph", "og:type, title, siteName and images emitted from CMS; article pages add OG images.", "Good"],
      ["Twitter Card", "summary_large_image with handle pulled from CMS social links.", "Good"],
      ["Image alt text", "Article hero alt = alt_text||headline (good); decorative thumbnails use alt=''. Depends on CMS images supplying alt text — verify.", "Needs Attention"],
      ["URL structure", "Clean, readable, keyword-relevant (/football, /guide/value-bets, /article/[slug]).", "Good"],
      ["XML sitemap", "Sitemap index of 10 segmented sitemaps with lastmod timestamps, referenced from robots.txt and now reachable.", "Good"],
    ],
    "Content Quality": [
      ["Content depth", "Homepage rich (~2k words); guides solid. But news is lorem-ipsum and About/Contact are placeholders.", "Needs Attention"],
      ["Keyword signals", "Strong topical coverage on guides and sport pages; homepage establishes the betting-comparison theme clearly.", "Good"],
      ["Freshness signals", "Article datePublished/dateModified in schema; visible 'Updated X ago' timestamps.", "Good"],
      ["Readability", "Scannable: subheadings, short paragraphs, on-page table-of-contents on guides.", "Good"],
    ],
    "Structured Data": [
      ["Organization + WebSite", "Site-wide @graph with Organization (@id, url, logo, sameAs, contactPoint) and WebSite with SearchAction.", "Good"],
      ["CollectionPage / ItemList", "Sport listings and article lists emit CollectionPage with ItemList of typed items.", "Good"],
      ["BreadcrumbList", "Present on article and sport surfaces.", "Good"],
      ["NewsArticle", "Article detail emits NewsArticle with author (Person) and publisher (Organization + logo).", "Good"],
      ["Schema validity", "Built conditionally — empty/unknown fields are omitted rather than emitted blank. Clean.", "Good"],
    ],
  },
  geo: {
    "E-E-A-T Assessment": [
      ["Author information", "Articles show authorName + optional bio; /experts exists but is thin (job titles only — no real bios, credentials or photos).", "Needs Attention"],
      ["About page", "Static placeholder (~150 words) with a build note to port the original about.html. No real company background.", "Missing"],
      ["Contact information", "/contact is a placeholder; Organization contactPoint only renders if the CMS supplies email/phone.", "Needs Attention"],
      ["Trust signals", "Strong, niche-appropriate responsible-gambling signals (18+, BeGambleAware, GamCare, GAMSTOP). No awards/press/testimonials.", "Needs Attention"],
      ["Organization entity", "Brand declared cleanly with @id, url, logo and sameAs (from CMS social links).", "Good"],
    ],
    "Content for AI Synthesis": [
      ["Factual density", "Guides carry concrete formulas, worked examples and numbers (e.g. implied-probability maths); homepage cites stats (120+ books, 14.7% value).", "Good"],
      ["Clear claims", "Value propositions and definitions stated plainly at the top of pages.", "Good"],
      ["Source citation", "Guides reference no external authorities or data sources AI engines could corroborate.", "Needs Attention"],
      ["Comprehensiveness", "Guides are concise and correct but short; news content is placeholder.", "Needs Attention"],
      ["Entity clarity", "Brand named consistently as OddsCheck.com across pages and schema.", "Good"],
    ],
    "Technical GEO": [
      ["Structured-data depth", "Rich core types, but no Author/Dataset/ClaimReview/SpeakableSpecification to deepen entity signals.", "Needs Attention"],
      ["HTTPS / security", "Served over HTTPS.", "Good"],
      ["AI crawlability", "robots.txt no longer blocks crawlers — GPTBot, PerplexityBot, Google-Extended and others can now reach the site.", "Good"],
      ["sameAs / brand links", "Social profile links emitted as sameAs from CMS social_links.", "Good"],
    ],
  },
  aeo: {
    "Featured Snippet Eligibility": [
      ["Direct-answer paragraphs", "Guides answer the question in a concise paragraph directly under a question heading — ideal snippet shape.", "Good"],
      ["Definition patterns", "Clear 'X is...' definitions ('Implied probability is the percentage chance...', 'A value bet is one where...').", "Good"],
      ["List content", "Some bulleted content, but few explicit numbered step lists ready to become list snippets.", "Needs Attention"],
      ["Table content", "Comparison tables are not prominent in guide content.", "Needs Attention"],
    ],
    "Structured Answer Formats": [
      ["FAQ schema", "No FAQPage markup anywhere, despite question-phrased headings throughout the guides.", "Missing"],
      ["HowTo schema", "'How to calculate it' / 'How accumulators work' are ideal HowTo candidates — none are marked up.", "Missing"],
      ["Question-phrased headings", "Guides use natural question language consistently.", "Good"],
      ["Speakable schema", "No SpeakableSpecification for voice-friendly sections.", "Missing"],
    ],
    "Voice Search Readiness": [
      ["Conversational language", "Guides are written in a natural, conversational tone.", "Good"],
      ["Long-tail coverage", "Guides address specific what/how/why questions a voice query would phrase.", "Good"],
      ["Local signals (NAP)", "No local-business signals; contact page is a placeholder. Likely N/A for this model, but note no LocalBusiness schema.", "Needs Attention"],
    ],
  },
  recs: [
    ["Critical", "Replace placeholder content: lorem-ipsum news feed, placeholder About and Contact pages. Publish real, substantive content.", "SEO / GEO", "High", "High"],
    ["High", "Add FAQPage + HowTo JSON-LD to /guide and /guide/[slug]. Content is already question-led and snippet-shaped.", "AEO", "Medium", "High"],
    ["High", "Build real author bios, credentials and photos on /experts, plus consistent bylines, to establish E-E-A-T.", "GEO", "Medium", "High"],
    ["Medium", "Ensure the CMS supplies meta descriptions for sport listing pages (currently description:null — they inherit nothing).", "SEO", "Low", "Medium"],
    ["Medium", "Populate Organization contactPoint/address and sameAs via the CMS so the entity graph is complete.", "GEO", "Low", "Medium"],
    ["Quick Win", "Confirm og:image (CMS site_og_image) renders on sport and guide pages for richer social/AI cards.", "SEO", "Low", "Medium"],
    ["Quick Win", "Audit CMS-supplied article/feed images for descriptive alt text.", "SEO", "Low", "Low"],
  ],
  strengths: [
    ["CMS-driven metadata architecture", "metadataBase, self-referencing canonical, Open Graph and Twitter cards built from /settings with no hardcoded brand strings — fields are omitted when absent rather than faked."],
    ["Comprehensive structured data", "Organization + WebSite with SearchAction site-wide; CollectionPage/ItemList, BreadcrumbList, SportsEvent and NewsArticle (with author + publisher) on the relevant surfaces."],
    ["Clean information architecture", "Readable, keyword-relevant URLs and a segmented sitemap index with lastmod timestamps."],
    ["Niche-appropriate trust signals", "Prominent 18+ and responsible-gambling links (BeGambleAware, GamCare, GAMSTOP) — exactly what this vertical needs for trust."],
    ["Snippet-ready guide content", "Guides lead with question-phrased headings and concise definitions/answers — one schema layer away from strong AEO performance."],
    ["Accessibility foundations", "Skip-to-content link, semantic <main>/<nav>, aria labels and decorative-image handling are in place."],
  ],
  limitations:
    "Some signals can't be assessed from HTML/source alone: Core Web Vitals and real page-speed (run pagespeed.web.dev), actual mobile rendering, how AI crawlers handle JS-rendered content, and the backlink profile / domain authority. Note also that this is a Vercel preview deployment still populated with some placeholder data. The earlier sitewide robots block flagged in the first pass of this audit has since been lifted (robots.txt now allows all crawlers), and the scores in this report reflect that fix.",
  glossary: [
    ["SEO — Search Engine Optimization", "Optimizing a site so traditional search engines (Google, Bing) can crawl, understand and rank its pages: titles, meta, headings, internal links, structured data and content quality."],
    ["GEO — Generative Engine Optimization", "Optimizing for AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews, Gemini) that synthesize and cite sources. Rewards clear authority (E-E-A-T), factual density, clean crawlability and a well-defined brand entity."],
    ["AEO — Answer Engine Optimization", "Optimizing for featured snippets, 'People Also Ask' and voice search by giving direct, concise answers under question-phrased headings and marking them up with FAQ/HowTo schema."],
  ],
};

// ── docx helpers ─────────────────────────────────────────────────────────────
const FONT = "Arial";
const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorder = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellBorder = (c = C.border) => {
  const b = { style: BorderStyle.SINGLE, size: 4, color: c };
  return { top: b, bottom: b, left: b, right: b };
};

function cell(children, { fill, width, valign = VerticalAlign.CENTER, borders, margins } = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    verticalAlign: valign,
    ...(width ? { width: { size: width, type: WidthType.DXA } } : {}),
    ...(fill ? { shading: { type: ShadingType.CLEAR, color: "auto", fill } } : {}),
    borders: borders || cellBorder(),
    margins: margins || { top: 80, bottom: 80, left: 120, right: 120 },
  });
}
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...o });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 },
    children: [run(text, { bold: true, size: 48, color: C.navy })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.blue, space: 6 } },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 120 },
    children: [run(text, { bold: true, size: 36, color: C.text })],
  });
}
function body(text, o = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [run(text, { size: 22, color: C.text })], ...o });
}

// findings table: Signal | Finding | Status
function findingsTable(rows) {
  const head = new TableRow({
    tableHeader: true,
    children: ["Signal", "Finding", "Status"].map((t, i) =>
      cell(para(run(t, { bold: true, color: C.white, size: 20 })), {
        fill: C.navy, width: [2000, 5760, 1600][i],
      })
    ),
  });
  const trs = rows.map((r, idx) => {
    const zebra = idx % 2 === 1 ? C.grayRow : C.white;
    return new TableRow({
      children: [
        cell(para(run(r[0], { bold: true, size: 20, color: C.text })), { fill: zebra, width: 2000 }),
        cell(para(run(r[1], { size: 20, color: C.text })), { fill: zebra, width: 5760 }),
        cell(para([run(r[2], { bold: true, color: C.white, size: 18 })], { alignment: AlignmentType.CENTER }), {
          fill: statusFill(r[2]), width: 1600,
        }),
      ],
    });
  });
  return new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [head, ...trs] });
}

// ── build the document ───────────────────────────────────────────────────────
function buildDoc() {
  // Cover section (no header/footer)
  const navyPara = (children, o = {}) =>
    new Paragraph({ alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, color: "auto", fill: C.navy }, children, ...o });

  const scoreCells = ["SEO", "GEO", "AEO"].map((k) =>
    cell(
      [
        para(run(k, { bold: true, color: C.white, size: 20 }), { alignment: AlignmentType.CENTER }),
        para(run(String(data.scores[k]), { bold: true, color: C.white, size: 72 }), { alignment: AlignmentType.CENTER }),
        para(run(data.statusWord[k], { italics: true, color: C.white, size: 18 }), { alignment: AlignmentType.CENTER }),
      ],
      { fill: scoreColor(data.scores[k]), width: 3120, borders: allNoBorder, margins: { top: 240, bottom: 240, left: 120, right: 120 } }
    )
  );
  const coverScoreTable = new Table({
    width: { size: 9360, type: WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [new TableRow({ children: scoreCells })],
  });

  const cover = {
    properties: {},
    children: [
      navyPara([run("", { size: 2 })], { spacing: { before: 1800, after: 200 } }),
      navyPara([run(DOMAIN, { bold: true, color: C.white, size: 72 })], { spacing: { after: 120 } }),
      navyPara([run("SEO / GEO / AEO Audit Report", { color: "93C5FD", size: 36 })], { spacing: { after: 120 } }),
      navyPara([run("FULL AUDIT", { color: C.white, size: 22 })], { spacing: { after: 400 } }),
      coverScoreTable,
      navyPara([run("", { size: 2 })], { spacing: { before: 1800, after: 120 } }),
      navyPara([run(`Audit date: ${DATE}`, { color: "94A3B8", size: 18 })], { spacing: { after: 40 } }),
      navyPara([run("Claude Skill and Plugin by Alex Labat", { color: "94A3B8", size: 18 })]),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };

  // Main section content
  const main = [];
  // Exec summary
  main.push(h1("Executive Summary"));
  main.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [new TableRow({ children: [cell(body(data.summary), { fill: C.lightBlue, width: 9360, margins: { top: 160, bottom: 160, left: 200, right: 200 } })] })],
    })
  );
  main.push(new Paragraph({ spacing: { after: 120 }, children: [run("")] }));

  // scores table
  const combined = data.scores.SEO + data.scores.GEO + data.scores.AEO;
  const sHead = new TableRow({
    tableHeader: true,
    children: ["Dimension", "Score", "Status", "Key Takeaway"].map((t, i) =>
      cell(para(run(t, { bold: true, color: C.white, size: 20 })), { fill: C.navy, width: [1600, 1100, 1700, 4960][i] })
    ),
  });
  const sRows = ["SEO", "GEO", "AEO"].map((k, idx) =>
    new TableRow({
      children: [
        cell(para(run(k, { bold: true, size: 20 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1600 }),
        cell(para([run(`${data.scores[k]}/10`, { bold: true, color: C.white, size: 20 })], { alignment: AlignmentType.CENTER }), { fill: scoreColor(data.scores[k]), width: 1100 }),
        cell(para(run(data.statusWord[k], { size: 20 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1700 }),
        cell(para(run(data.takeaway[k], { size: 19 })), { fill: idx % 2 ? C.grayRow : C.white, width: 4960 }),
      ],
    })
  );
  const sCombined = new TableRow({
    children: [
      cell(para(run("Combined", { bold: true, size: 20 })), { fill: C.lightBlue, width: 1600 }),
      cell(para([run(`${combined}/30`, { bold: true, color: C.navy, size: 20 })], { alignment: AlignmentType.CENTER }), { fill: C.lightBlue, width: 1100 }),
      cell(para(run("", { size: 20 })), { fill: C.lightBlue, width: 1700 }),
      cell(para(run("", { size: 20 })), { fill: C.lightBlue, width: 4960 }),
    ],
  });
  main.push(new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [sHead, ...sRows, sCombined] }));

  // Pages audited
  main.push(h1("Pages Audited"));
  const pHead = new TableRow({
    tableHeader: true,
    children: ["Page", "Type", "Notes"].map((t, i) => cell(para(run(t, { bold: true, color: C.white, size: 20 })), { fill: C.navy, width: [2200, 1900, 5260][i] })),
  });
  const pRows = data.pages.map((r, idx) =>
    new TableRow({
      children: [
        cell(para(run(r[0], { bold: true, size: 19, color: C.text })), { fill: idx % 2 ? C.grayRow : C.white, width: 2200 }),
        cell(para(run(r[1], { size: 19 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1900 }),
        cell(para(run(r[2], { size: 19 })), { fill: idx % 2 ? C.grayRow : C.white, width: 5260 }),
      ],
    })
  );
  main.push(new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [pHead, ...pRows] }));

  // Analysis sections
  const section = (title, score, groups) => {
    main.push(h1(`${title}  —  ${score}/10`));
    for (const [sub, rows] of Object.entries(groups)) {
      main.push(h2(sub));
      main.push(findingsTable(rows));
      main.push(new Paragraph({ spacing: { after: 80 }, children: [run("")] }));
    }
  };
  section("SEO Analysis", data.scores.SEO, data.seo);
  section("GEO Analysis", data.scores.GEO, data.geo);
  section("AEO Analysis", data.scores.AEO, data.aeo);

  // Priority recommendations
  main.push(h1("Priority Recommendations"));
  const prFill = { Critical: C.red, High: C.orange, Medium: C.amber, "Quick Win": C.green };
  const rHead = new TableRow({
    tableHeader: true,
    children: ["Priority", "Issue", "Dimension", "Effort", "Impact"].map((t, i) =>
      cell(para(run(t, { bold: true, color: C.white, size: 19 })), { fill: C.navy, width: [1300, 4360, 1700, 1000, 1000][i] })
    ),
  });
  const rRows = data.recs.map((r, idx) =>
    new TableRow({
      children: [
        cell(para([run(r[0], { bold: true, color: C.white, size: 18 })], { alignment: AlignmentType.CENTER }), { fill: prFill[r[0]] || C.amber, width: 1300 }),
        cell(para(run(r[1], { size: 18 })), { fill: idx % 2 ? C.grayRow : C.white, width: 4360 }),
        cell(para(run(r[2], { size: 18 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1700 }),
        cell(para(run(r[3], { size: 18 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1000 }),
        cell(para(run(r[4], { size: 18 })), { fill: idx % 2 ? C.grayRow : C.white, width: 1000 }),
      ],
    })
  );
  main.push(new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [rHead, ...rRows] }));

  // What's working well
  main.push(h1("What's Working Well"));
  const wRows = data.strengths.map((r, idx) =>
    new TableRow({
      children: [
        cell(para(run(r[0], { bold: true, size: 20, color: C.green })), { fill: idx % 2 ? C.greenBg : C.white, width: 2900 }),
        cell(para(run(r[1], { size: 19, color: C.text })), { fill: idx % 2 ? C.greenBg : C.white, width: 6460 }),
      ],
    })
  );
  main.push(new Table({ width: { size: 9360, type: WidthType.DXA }, rows: wRows }));

  // Methodology / limitations
  main.push(h1("Scope & Limitations"));
  main.push(body(data.limitations));

  // Glossary
  main.push(h1("Glossary"));
  for (const [term, def] of data.glossary) {
    main.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [run(term, { bold: true, size: 22, color: C.navy })] }));
    main.push(body(def));
  }

  const header = new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.navy, space: 4 } },
        tabStops: [{ type: "right", position: 9360 }],
        children: [run(DOMAIN, { size: 16, color: C.navy, bold: true }), run("\tSEO / GEO / AEO Audit Report", { size: 16, color: C.muted })],
      }),
    ],
  });
  const footer = new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.border, space: 4 } },
        tabStops: [{ type: "right", position: 9360 }],
        children: [run("Claude Skill and Plugin by Alex Labat", { size: 16, color: C.muted }), new TextRun({ children: ["\tPage ", PageNumber.CURRENT], font: FONT, size: 16, color: C.muted })],
      }),
    ],
  });

  return new Document({
    styles: { default: { document: { run: { font: FONT, color: C.text } } } },
    sections: [
      { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, ...cover },
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        headers: { default: header }, footers: { default: footer }, children: main,
      },
    ],
  });
}

// ── HTML (for PDF) ───────────────────────────────────────────────────────────
function buildHtml() {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const stChip = (s) => `<span class="st" style="background:#${statusFill(s)}">${esc(s)}</span>`;
  const findTable = (rows) =>
    `<table class="ft"><thead><tr><th>Signal</th><th>Finding</th><th class="c">Status</th></tr></thead><tbody>${rows
      .map((r) => `<tr><td class="sig">${esc(r[0])}</td><td>${esc(r[1])}</td><td class="c">${stChip(r[2])}</td></tr>`)
      .join("")}</tbody></table>`;
  const sectionHtml = (title, score, groups) =>
    `<h1>${esc(title)} &nbsp;&mdash;&nbsp; ${score}/10</h1>` +
    Object.entries(groups).map(([sub, rows]) => `<h2>${esc(sub)}</h2>${findTable(rows)}`).join("");
  const combined = data.scores.SEO + data.scores.GEO + data.scores.AEO;
  const prColor = { Critical: C.red, High: C.orange, Medium: C.amber, "Quick Win": C.green };

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:Letter;margin:18mm 16mm;}
*{box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;color:#${C.text};font-size:10.5pt;line-height:1.5;margin:0;}
.cover{background:#${C.navy};color:#fff;text-align:center;height:247mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always;border-radius:0;margin:-18mm -16mm 0;padding:0 16mm;}
.cover .dom{font-size:34pt;font-weight:700;margin:0 0 8px;}
.cover .sub{font-size:17pt;color:#93C5FD;margin:0 0 8px;}
.cover .type{font-size:11pt;letter-spacing:2px;margin:0 0 28px;}
.cover .scores{display:flex;gap:0;justify-content:center;}
.cover .sc{flex:1;max-width:33%;padding:22px 8px;color:#fff;}
.cover .sc .k{font-size:11pt;font-weight:700;}
.cover .sc .n{font-size:34pt;font-weight:700;line-height:1.1;}
.cover .sc .w{font-size:9pt;font-style:italic;}
.cover .attr{margin-top:34px;color:#94A3B8;font-size:9pt;}
h1{color:#${C.navy};font-size:18pt;border-bottom:2px solid #${C.blue};padding-bottom:5px;margin:26px 0 12px;page-break-after:avoid;}
h2{color:#${C.text};font-size:13pt;margin:18px 0 8px;page-break-after:avoid;}
.gloss-term{color:#${C.navy};font-weight:700;font-size:11pt;margin:10px 0 2px;}
table{border-collapse:collapse;width:100%;margin:6px 0 14px;font-size:9pt;page-break-inside:auto;}
th,td{border:0.75pt solid #${C.border};padding:6px 9px;vertical-align:top;text-align:left;}
thead th{background:#${C.navy};color:#fff;font-weight:700;}
tr:nth-child(even) td{background:#${C.grayRow};}
.ft td.sig{font-weight:700;width:20%;}
.c{text-align:center;}
.st{display:inline-block;color:#fff;font-weight:700;font-size:8pt;padding:3px 8px;border-radius:4px;white-space:nowrap;}
.summary{background:#${C.lightBlue};border-radius:6px;padding:14px 18px;margin:6px 0 16px;}
.combined td{background:#${C.lightBlue}!important;font-weight:700;color:#${C.navy};}
.pri{color:#fff;font-weight:700;text-align:center;border-radius:4px;}
.str td.name{font-weight:700;color:#${C.green};width:30%;}
.str tr:nth-child(even) td{background:#${C.greenBg};}
.str tr:nth-child(odd) td{background:#fff;}
</style></head><body>
<div class="cover">
  <div class="dom">${esc(DOMAIN)}</div>
  <div class="sub">SEO / GEO / AEO Audit Report</div>
  <div class="type">FULL AUDIT</div>
  <div class="scores">
    ${["SEO", "GEO", "AEO"].map((k) => `<div class="sc" style="background:#${scoreColor(data.scores[k])}"><div class="k">${k}</div><div class="n">${data.scores[k]}</div><div class="w">${esc(data.statusWord[k])}</div></div>`).join("")}
  </div>
  <div class="attr">Audit date: ${DATE}<br>Claude Skill and Plugin by Alex Labat</div>
</div>

<h1>Executive Summary</h1>
<div class="summary">${esc(data.summary)}</div>
<table><thead><tr><th>Dimension</th><th class="c">Score</th><th>Status</th><th>Key Takeaway</th></tr></thead><tbody>
${["SEO", "GEO", "AEO"].map((k) => `<tr><td><b>${k}</b></td><td class="c" style="background:#${scoreColor(data.scores[k])};color:#fff;font-weight:700">${data.scores[k]}/10</td><td>${esc(data.statusWord[k])}</td><td>${esc(data.takeaway[k])}</td></tr>`).join("")}
<tr class="combined"><td>Combined</td><td class="c">${combined}/30</td><td></td><td></td></tr>
</tbody></table>

<h1>Pages Audited</h1>
<table><thead><tr><th>Page</th><th>Type</th><th>Notes</th></tr></thead><tbody>
${data.pages.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}
</tbody></table>

${sectionHtml("SEO Analysis", data.scores.SEO, data.seo)}
${sectionHtml("GEO Analysis", data.scores.GEO, data.geo)}
${sectionHtml("AEO Analysis", data.scores.AEO, data.aeo)}

<h1>Priority Recommendations</h1>
<table><thead><tr><th>Priority</th><th>Issue</th><th>Dimension</th><th>Effort</th><th>Impact</th></tr></thead><tbody>
${data.recs.map((r) => `<tr><td class="pri" style="background:#${prColor[r[0]] || C.amber}">${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join("")}
</tbody></table>

<h1>What's Working Well</h1>
<table class="str"><tbody>
${data.strengths.map((r) => `<tr><td class="name">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}
</tbody></table>

<h1>Scope &amp; Limitations</h1>
<p>${esc(data.limitations)}</p>

<h1>Glossary</h1>
${data.glossary.map(([t, d]) => `<div class="gloss-term">${esc(t)}</div><p>${esc(d)}</p>`).join("")}
</body></html>`;
}

// ── emit ─────────────────────────────────────────────────────────────────────
const htmlPath = path.join(OUT, `${FILEBASE}.html`);
fs.writeFileSync(htmlPath, buildHtml());
console.log("HTML written:", htmlPath);

Packer.toBuffer(buildDoc()).then((buf) => {
  const docxPath = path.join(OUT, `${FILEBASE}.docx`);
  fs.writeFileSync(docxPath, buf);
  console.log("DOCX written:", docxPath);
});
