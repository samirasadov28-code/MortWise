import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MortWise — Understand Your Mortgage',
  description: 'Compare fixed, variable, and split-rate mortgages. Stress-test against rate rises. See what you actually pay over 30 years.',
  keywords: 'mortgage calculator, mortgage comparison, first time buyer, Ireland, UK, UAE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1a1a2e] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
