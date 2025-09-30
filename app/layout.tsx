import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hinn.dev";

const spaceGroteskSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Removed mono font to avoid Turbopack internal font resolver issue

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hinn.dev",
    template: "%s | Hinn.dev",
  },
  description: "Pay‑by‑month, all‑inclusive website design.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Hinn.dev",
    title: "Hinn.dev",
    description: "Pay‑by‑month, all‑inclusive website design.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hinn.dev",
    description: "Pay‑by‑month, all‑inclusive website design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGroteskSans.variable} font-sans antialiased text-black`}>
        {/* JSON-LD: Organization and Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hinn.dev",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.svg`,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Hinn.dev",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
