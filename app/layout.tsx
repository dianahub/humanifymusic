import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Humanify.music — Real Music, Real Artists",
  description: "The only streaming platform that exclusively features human-made music, rated A–F for production purity.",
  openGraph: {
    title: "Humanify.music — Real Music, Real Artists",
    description: "Discover music with a soul. Every track rated for authenticity.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
