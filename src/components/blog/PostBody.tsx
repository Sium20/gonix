/**
 * Minimal post body renderer.
 * - Splits on blank lines into paragraphs
 * - Lines starting with # → heading (h2/h3)
 * - Lines starting with > → blockquote
 * - Lines starting with - → bullet list
 * - **bold** and *italic* inline
 * - Plain URLs become links
 * No external markdown lib needed for v1.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  // bare URLs → links
  out = out.replace(/(https?:\/\/[^\s<]+)(?=[<]|\s|$)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>');
  return out;
}

export function PostBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).filter(Boolean);

  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("### ")) return `<h3>${inline(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${inline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("# ")) return `<h2>${inline(trimmed.slice(2))}</h2>`;

      const lines = trimmed.split("\n");
      const allBullets = lines.every((l) => l.startsWith("- "));
      if (allBullets && lines.length > 0) {
        return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;
      }

      const allQuotes = lines.every((l) => l.startsWith("> "));
      if (allQuotes && lines.length > 0) {
        return `<blockquote>${lines.map((l) => inline(l.slice(2))).join("<br/>")}</blockquote>`;
      }

      // Plain paragraph
      return `<p>${lines.map(inline).join("<br/>")}</p>`;
    })
    .join("\n");

  return (
    <div
      className="prose-post"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
