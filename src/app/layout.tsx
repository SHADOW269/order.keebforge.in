import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { NumberInputGuard } from "@/components/NumberInputGuard";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--ff-d",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-b",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KeebForge Order Tracking",
    template: "%s | KeebForge",
  },
  description:
    "Track your custom mechanical keyboard order, monitor build progress, shipping updates, and warranty status with KeebForge.",
  applicationName: "KeebForge Order Tracking",
  keywords: [
    "KeebForge",
    "Mechanical Keyboard",
    "Keyboard Build",
    "Order Tracking",
    "Custom Keyboard",
    "Keyboard Modding",
    "India",
  ],
  authors: [{ name: "KeebForge" }],
  creator: "KeebForge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <NumberInputGuard />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
