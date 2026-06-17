// Renders a JSON-LD <script>. `data` is app-controlled (never user input), so the
// serialized JSON is safe; we escape `<` to avoid breaking out of the script tag.
export default function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
