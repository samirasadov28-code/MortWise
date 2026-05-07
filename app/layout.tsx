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
  title: 'MortWise — Understand Your Mortgage',
  description:
    'Compare fixed, variable, and split-rate mortgages. Stress-test against rate rises. See what you actually pay over 30 years.',
  keywords: 'mortgage calculator, mortgage comparison, first time buyer, Ireland, UK, UAE',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'MortWise — Understand Your Mortgage',
    description:
      'Compare fixed, variable, and split-rate mortgages across 50+ markets. Stress-test against rate rises. See what you actually pay over 30 years.',
    images: [{ url: '/Logo_512.png', width: 512, height: 512, alt: 'MortWise' }],
  },
  twitter: {
    card: 'summary',
    title: 'MortWise — Understand Your Mortgage',
    description:
      'Compare fixed, variable, and split-rate mortgages across 50+ markets.',
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
    'Mortgage comparison and stress-testing for first-time buyers across 50+ housing markets.',
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
