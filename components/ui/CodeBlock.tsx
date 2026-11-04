import { highlightJs } from "@/lib/highlight";

export function CodeBlock({ code, head }: { code: string; head?: string }) {
  return (
    <div className="codeblock">
      {head ? (
        <div className="codeblock-head">
          <span>{head}</span>
        </div>
      ) : null}
      <pre>
        {/* highlightJs escapes every token. */}
        <code dangerouslySetInnerHTML={{ __html: highlightJs(code) }} />
      </pre>
    </div>
  );
}
