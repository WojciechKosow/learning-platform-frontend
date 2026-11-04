import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Ambient } from "@/components/ui/Ambient";
import { UiProvider } from "@/components/ui/UiProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Codetta | Learn by building",
    template: "%s | Codetta",
  },
  description:
    "Codetta: learn programming by building real apps in a browser IDE, with an AI mentor that reads your code and hints in steps.",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0C0B10" },
    { media: "(prefers-color-scheme: light)", color: "#F4F3F7" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-ambient="on"
      data-motion="full"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <UiProvider>
          <Ambient />
          <div className="app-root">{children}</div>
        </UiProvider>
      </body>
    </html>
  );
}
