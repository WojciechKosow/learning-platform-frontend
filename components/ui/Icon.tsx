import { ICONS, type IconName } from "@/lib/icons";

type IconProps = {
  name: IconName;
  /** Extra classes, e.g. "sm", "lg" or a colour helper like "fi-js". */
  className?: string;
};

/** Stroke icon (24×24 Lucide geometry). Decorative: hidden from screen readers. */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className ? `svg-i ${className}` : "svg-i"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      // Static, trusted path data from lib/icons.ts.
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}

/** The Codetta mark: a "c" with a blinking caret. */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span>c</span>
      <i />
    </span>
  );
}

export function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
      <path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
