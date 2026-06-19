// Clean-URL guard. Scans src/ for legacy query-string URL forms that must stay
// migrated to canonical paths — the reversion that keeps reappearing across
// iterations. Run as a CLI (npm run check:urls / pre-commit) or imported by the
// Vitest guard (src/lib/clean-urls.test.js) so CI fails the moment one returns.
//
//   /article?slug=   -> /article/[slug]
//   /review?author=  -> /review/[slug]
//   /event?sport=…   -> /event/[sport]/[id]
//
// The back-compat redirector pages (src/app/{article,event,review}/page.js)
// legitimately name the legacy forms in their header comment; full-line comments
// and any line mentioning "Back-compat redirector" are ignored.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const LEGACY = [
  { re: /\/article\?slug=/, label: "/article?slug= (use /article/[slug])" },
  { re: /\/review\?author=/, label: "/review?author= (use /review/[slug])" },
  { re: /\/event\?(sport|slug|id)=/, label: "/event?… (use /event/[sport]/[id])" },
];

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);
const CODE_EXT = /\.(js|jsx|mjs|cjs|ts|tsx)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (CODE_EXT.test(name)) yield full;
  }
}

/** Scan a directory tree; returns [{ file, line, label, text }] for every hit. */
export function scanLegacyUrls(root) {
  const hits = [];
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((raw, i) => {
      if (/Back-compat redirector/i.test(raw)) return; // documented redirector note
      const code = raw.replace(/^\s*\/\/.*$/, "");       // drop full-line comments
      for (const { re, label } of LEGACY) {
        if (re.test(code)) hits.push({ file, line: i + 1, label, text: raw.trim() });
      }
    });
  }
  return hits;
}

// CLI entry: scan src/ and exit non-zero on any hit.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hits = scanLegacyUrls(join(process.cwd(), "src"));
  if (hits.length) {
    console.error(`\n✖ clean-URL guard failed — ${hits.length} legacy URL(s) found:\n`);
    for (const h of hits) {
      console.error(`  ${relative(process.cwd(), h.file)}:${h.line}  ${h.label}`);
      console.error(`    ${h.text}`);
    }
    console.error("\nMigrate these to canonical paths before committing.\n");
    process.exit(1);
  }
  console.log("✓ clean-URL guard passed — no legacy query-string URLs in src/.");
}
