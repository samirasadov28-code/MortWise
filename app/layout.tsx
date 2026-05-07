import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import FeedbackButton from '@/components/shared/FeedbackButton';
import MortgageChat from '@/components/shared/MortgageChat';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MortWise — Understand Your Mortgage',
  description: 'Compare fixed, variable, and split-rate mortgages. Stress-test against rate rises. See what you actually pay over 30 years.',
  keywords: 'mortgage calculator, mortgage comparison, first time buyer, Ireland, UK, UAE',
  icons: {
    icon: [
      { url: '/Logo_192.png', sizes: '192x192', type: 'image/png' },
      { url: '/Logo_512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/Logo_192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f3ef] text-[#2a2520] min-h-screen`}>
        <I18nProvider>
          {children}
          <FeedbackButton />
          <MortgageChat />
        </I18nProvider>
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
