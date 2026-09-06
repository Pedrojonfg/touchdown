import type { Metadata } from "next";
import { Montserrat, PT_Serif, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// ponytail: Museo Sans isn't on Google Fonts; Source Sans 3 is the IE web stand-in
const museo = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-museo",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-display",
});

const serif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Touchdown — IE Aerospace Club",
  description: "One-button lander. Live booth leaderboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${museo.variable} ${montserrat.variable} ${serif.variable}`}
    >
      <body className={`${museo.className} antialiased`}>{children}</body>
    </html>
  );
}
