import React from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import SessionTimeout from '@/components/shared/session-timeout';
import { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Satu Data | Sovereign EMR & Blockchain Healthcare System',
  description:
    'Platform Rekam Medis Terintegrasi Berbasis Blockchain Satu Data untuk Pasien, Faskes, dan Administrator.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 font-sans">
        {children}
        <SessionTimeout />
      </body>
    </html>
  );
}
