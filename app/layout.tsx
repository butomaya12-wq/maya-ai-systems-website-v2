import type { Metadata } from "next";
import "./globals.css";
import "./cinematic.css";
import "@/style/visual-engine-v3.css";
import "@/style/content-v3.css";
import "@/style/hero-v4.css";
import "@/style/hero-focus-v5.css";
import "@/style/template-fusion-v1.css";
import "@/style/hero-case-bridge.css";
import "@/style/commercial-case-story.css";
import "@/style/process-principles.css";

export const metadata: Metadata = {
  title: "Maya — AI Systems Engineer",
  description:
    "Applied AI systems, operational workflows, integrations, and evidence-driven engineering.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
