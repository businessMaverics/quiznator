import { Cinzel, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { MathJaxContext } from "better-react-mathjax";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "D'MAVERICS QUIznator",
  description: "Advanced learning platform for students",
  manifest: "/manifest.json",
  themeColor: "#FFD700",
};

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${inter.variable} antialiased`}
      >
        <MathJaxContext config={mathJaxConfig}>
          {children}
        </MathJaxContext>
        <Analytics />
      </body>
    </html>
  );
}
