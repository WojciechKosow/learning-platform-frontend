// Tiny regex-based syntax highlighter (JS only — all the landing page needs).
// Returns HTML with every token escaped, so it is safe to inject.

const JS_KW =
  "import|export|from|default|const|let|var|function|return|if|else|for|while|do|of|in|new|class|extends|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|break|continue|this|yield|delete|void|as|interface|type|enum|implements|public|private|readonly";

const RULES: [string, RegExp][] = [
  ["c", /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
  ["s", /`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*"/],
  ["tag", /<\/?[A-Za-z][\w.]*|\/>/],
  ["l", /\b(?:true|false|null|undefined|NaN)\b/],
  ["k", new RegExp(`\\b(?:${JS_KW})\\b`)],
  ["n", /\b\d+(?:\.\d+)?\b/],
  ["f", /\b[A-Za-z_$][\w$]*(?=\s*\()/],
  ["t", /\b[A-Z][\w$]*\b/],
  ["a", /\b[a-zA-Z][\w-]*(?==(?!=)["'{])/],
  ["p", /(?<=\.)[A-Za-z_$][\w$]*/],
  ["o", /=>|===|!==|&&|\|\||\?\?|[+\-*/%]=?|[=!<>]=?|\?|:/],
];

const RE_SOURCE = RULES.map(([, r]) => `(${r.source})`).join("|");
const NAMES = RULES.map(([n]) => n);

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

export function highlightJs(code: string): string {
  const re = new RegExp(RE_SOURCE, "g");
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    let gi = 1;
    while (gi < m.length && m[gi] === undefined) gi++;
    out += escapeHtml(code.slice(last, m.index));
    out += `<span class="t-${NAMES[gi - 1]}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(code.slice(last));
}
