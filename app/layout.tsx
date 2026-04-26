import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import FeedbackButton from '@/components/shared/FeedbackButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MortWise — Understand Your Mortgage',
  description: 'Compare fixed, variable, and split-rate mortgages. Stress-test against rate rises. See what you actually pay over 30 years.',
  keywords: 'mortgage calculator, mortgage comparison, first time buyer, Ireland, UK, UAE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f3ef] text-[#2a2520] min-h-screen`}>
        {children}
        <FeedbackButton />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5W0SH4M6KV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5W0SH4M6KV');
          `}
        </Script>
      </body>
    </html>
  );
}
