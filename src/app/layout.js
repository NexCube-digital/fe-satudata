import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionTimeout from "@/components/SessionTimeout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Satu Data | Frontend Rekam Medis",
  description:
    "Frontend Satu Data untuk landing page publik, panel pasien, panel rumah sakit, dan alur consent rekam medis berbasis blockchain.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 font-sans">
        {children}
        <SessionTimeout />
      </body>
    </html>
  );
}
