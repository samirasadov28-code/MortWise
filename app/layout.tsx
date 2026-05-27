import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import FeedbackButton from '@/components/shared/FeedbackButton';
import MortgageChat from '@/components/shared/MortgageChat';
import Toaster from '@/components/shared/Toaster';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mortwise.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'MortWise — AI-Powered Mortgage Assistant',
  description:
    'AI-powered mortgage comparison and stress-testing. Compare fixed, variable and split-rate scenarios, get AI-generated market rates, and ask the built-in AI assistant anything about your mortgage across 50+ markets.',
  keywords: [
    'mortgage calculator', 'mortgage comparison', 'AI mortgage calculator', 'AI mortgage assistant',
    'first time buyer mortgage', 'mortgage stress test', 'fixed rate mortgage calculator',
    'variable rate mortgage calculator', 'split rate mortgage', 'buy to let mortgage calculator',
    'mortgage affordability calculator', 'LTV calculator', 'stamp duty calculator',
    'Ireland mortgage calculator', 'UK mortgage calculator', 'UAE mortgage calculator',
    'Germany mortgage calculator', 'France mortgage calculator', 'Spain mortgage calculator',
    'mortgage repayment calculator', 'how much can I borrow', 'mortgage overpayment calculator',
    'interest only mortgage calculator', 'mortgage rate comparison', 'cashback mortgage',
    'mortgage advisor tool', 'best mortgage calculator', 'free mortgage calculator',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'MortWise — AI-Powered Mortgage Assistant',
    description:
      'AI-powered mortgage comparison and stress-testing across 50+ housing markets. AI-generated rate cards, built-in mortgage chat assistant, full cost-of-ownership analysis.',
    images: [{ url: '/Logo_512.png', width: 512, height: 512, alt: 'MortWise — AI mortgage assistant' }],
  },
  twitter: {
    card: 'summary',
    title: 'MortWise — AI-Powered Mortgage Assistant',
    description:
      'AI-powered mortgage comparison across 50+ markets, with built-in AI chat.',
    images: ['/Logo_512.png'],
  },
  icons: {
    icon: [
      { url: '/Logo_192.png', sizes: '192x192', type: 'image/png' },
      { url: '/Logo_512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/Logo_192.png',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'MortWise',
  url: SITE_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered mortgage comparison and stress-testing for first-time buyers across 50+ housing markets, with AI-generated rate cards and a built-in AI mortgage chat assistant.',
  featureList: [
    'AI-generated market rate cards per lender',
    'AI mortgage chat assistant',
    'Stress-testing against rate rises',
    'Side-by-side comparison across markets',
  ],
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Full', price: '3.99', priceCurrency: 'EUR' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f5f3ef] text-[#2a2520] min-h-screen`}>
        <I18nProvider>
          {children}
          <FeedbackButton />
          <MortgageChat />
          <Toaster />
        </I18nProvider>
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5W0SH4M6KV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-5W0SH4M6KV');
          `}
        </Script>
      </body>
    </html>
  );
}
