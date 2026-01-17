import { Cinzel, Inter } from "next/font/google";
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
