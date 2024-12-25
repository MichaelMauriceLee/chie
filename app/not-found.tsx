import NotFoundMessage from "@/components/not-found/message";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next"; 
import en from "../messages/en.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: en.Metadata.title,
  description: en.Metadata.description,
};

export default function NotFound() {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotFoundMessage
          title={en.NotFound.title}
          description={en.NotFound.description}
          backHome={en.NotFound.backHome}
        />
      </body>
    </html>
  );
}
