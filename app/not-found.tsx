"use client";
import NotFoundPage from "@/components/not-found-page";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function NotFound() {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotFoundPage
          title="404 - Page Not Found"
          description="Sorry, we couldn’t find the page you’re looking for."
          backHome="Go back home"
        />
      </body>
    </html>
  );
}
