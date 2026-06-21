import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walid Slim — MCP Platform Engineer",
  description:
    "Don't read my portfolio. Interview it. Senior Software Engineer building MCP infrastructure, AI concierge systems, and booking platforms.",
  openGraph: {
    title: "Walid Slim — MCP Platform Engineer",
    description:
      "Don't read my portfolio. Interview it. AI agents can connect via MCP at /api/mcp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
