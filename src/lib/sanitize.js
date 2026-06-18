import sanitizeHtml from "sanitize-html";

// Server-side HTML sanitizer for CMS-authored article bodies. Replaces
// isomorphic-dompurify: that pulled in jsdom, whose encoding chain
// (html-encoding-sniffer → @exodus/bytes, ESM) crashes the Node serverless
// runtime on Vercel with ERR_REQUIRE_ESM. sanitize-html is pure Node (htmlparser2),
// needs no DOM, and ships a much smaller serverless function.
//
// The allowlist is permissive enough to keep rich article formatting (headings,
// lists, tables, images, inline emphasis/links) while stripping scripts, event
// handlers, and dangerous URL schemes. iframes/embeds are intentionally NOT
// allowed (matching DOMPurify's default behaviour).
const OPTIONS = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "pre", "code", "span", "div",
    "strong", "b", "em", "i", "u", "s", "sub", "sup", "mark", "small", "abbr",
    "ul", "ol", "li", "dl", "dt", "dd",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    col: ["span"],
    "*": ["class", "id", "style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  // Harden any target=_blank links against reverse-tabnabbing.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, false),
  },
};

export function sanitizeArticleHtml(html) {
  return sanitizeHtml(html || "", OPTIONS);
}
