import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "CaseFlow MCP — Legal Intelligence Platform",
  description: "MCP-first unified legal workflow platform for attorneys",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)", position: "relative" }}>
          <div className="page-transition">{children}</div>
        </main>
      </body>
    </html>
  );
}
