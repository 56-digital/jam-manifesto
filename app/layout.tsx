import type { Metadata } from "next";
import "./globals.css";
import { MusicProvider } from "@/components/MusicProvider";

export const metadata: Metadata = {
  title: "Drone Circle",
  description:
    "An agentic music system — natural language meets modular synthesis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
