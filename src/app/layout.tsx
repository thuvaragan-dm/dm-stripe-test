import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stripe Tokens POC",
  description: "Subscriptions + token usage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#ffffff', color: '#111827' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <a href="/" style={{ fontWeight: 700, fontSize: 18, color: '#111827', textDecoration: 'none' }}>Stripe Tokens</a>
            <nav style={{ display: 'flex', gap: 12 }}>
              <a href="/" style={{ color: '#111827', textDecoration: 'none' }}>Pricing</a>
              <a href="/dashboard" style={{ color: '#111827', textDecoration: 'none' }}>Dashboard</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
