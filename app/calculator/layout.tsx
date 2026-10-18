import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MortWise — Free Mortgage Calculator',
  description:
    'Calculate your mortgage repayments, stamp duty, and total cost of ownership in seconds. Compare fixed, variable, and split-rate mortgages across 50+ markets with AI-generated rate cards.',
  keywords: [
    'free mortgage calculator',
    'mortgage repayment calculator',
    'stamp duty calculator',
    'how much can I borrow',
    'mortgage affordability checker',
    'fixed vs variable mortgage',
    'first time buyer calculator',
    'buy to let mortgage calculator',
    'mortgage stress test tool',
    'LTV calculator',
  ],
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    type: 'website',
    title: 'MortWise — Free Mortgage Calculator',
    description:
      'Instant mortgage repayments, stamp duty, stress tests, and side-by-side scenario comparison across 50+ housing markets.',
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
