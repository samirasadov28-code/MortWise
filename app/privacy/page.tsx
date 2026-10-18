import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — MortWise',
  description: 'Privacy Policy for the MortWise mortgage analysis application.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#2a2520]">
      <nav className="sticky top-0 z-40 border-b border-[#e8e3dc] bg-[#f5f3ef]/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm text-[#4a7c96] hover:underline">
            ← Back to MortWise
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#2a2520] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#6b7a8a] mb-10">
          <strong>Effective date: 2 June 2026</strong>
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-[#2a2520]">

          <p>
            This Privacy Policy explains how MortWise (&ldquo;MortWise,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
            uses, and protects your information when you use the MortWise application and website at{' '}
            <a href="https://mortwise.netlify.app" className="text-[#4a7c96] hover:underline">
              https://mortwise.netlify.app
            </a>{' '}
            (the &ldquo;Service&rdquo;). By using the Service, you agree to the practices described here.
          </p>

          {/* Information we collect */}
          <section>
            <h2 className="text-xl font-bold mb-3">Information we collect</h2>
            <p className="mb-3">
              <strong>Usage data.</strong> We automatically collect limited technical information such
              as device type, browser, general usage activity, and log data to operate, secure, and
              improve the Service.
            </p>
            <p className="mb-3">
              <strong>Payment information.</strong> If you subscribe to a paid plan, payments are
              processed by our third-party payment processor, Stripe. We do not collect or store your
              full payment card details on our servers; that information is handled directly by Stripe
              under its own terms and privacy policy.
            </p>
            <p className="mb-3">
              <strong>Email address.</strong> If you use the early-access unlock feature or submit
              feedback, you may provide your email address. We use this solely to verify access
              eligibility or to respond to your feedback. We do not use it for marketing without your
              consent.
            </p>
            <p>
              <strong>Analytics data.</strong> We use Google Analytics to understand aggregate usage
              patterns and improve the Service. Google Analytics collects information such as pages
              visited, time spent, and general geographic region. See{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a7c96] hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>{' '}
              for details.
            </p>
          </section>

          {/* How we use */}
          <section>
            <h2 className="text-xl font-bold mb-3">How we use your information</h2>
            <p>
              We use the information we collect to provide and maintain the Service, process payments,
              verify access eligibility, communicate with you about your feedback or subscription, and
              analyse and improve features, performance, and security.
            </p>
          </section>

          {/* AI-generated content */}
          <section>
            <h2 className="text-xl font-bold mb-3">AI-generated content</h2>
            <p>
              MortWise uses third-party artificial-intelligence services (Google Gemini and Groq) to
              generate mortgage rate estimates and power the built-in chat assistant. Inputs you
              provide for these features — such as market selection, loan parameters, and chat
              messages — may be transmitted to those providers solely to produce results for you.
              Please do not enter sensitive personal or financial data you would not want shared with
              a third-party AI provider.
            </p>
          </section>

          {/* How we share */}
          <section>
            <h2 className="text-xl font-bold mb-3">How we share information</h2>
            <p>
              We do not sell your personal information. We share information only with service
              providers who help us operate the Service and who process data on our behalf under
              their own privacy and security obligations:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>
                <strong>Netlify</strong> — hosting and infrastructure provider.
              </li>
              <li>
                <strong>Stripe</strong> — payment processing. See{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4a7c96] hover:underline"
                >
                  Stripe&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Gemini</strong> — AI rate-card generation and chat. See{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4a7c96] hover:underline"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Groq</strong> — AI inference provider. See{' '}
                <a
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4a7c96] hover:underline"
                >
                  Groq&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Analytics</strong> — aggregate usage analytics.
              </li>
            </ul>
            <p className="mt-3">
              We may also disclose information where required by law or to protect the rights,
              property, or safety of MortWise, our users, or the public.
            </p>
          </section>

          {/* Data retention */}
          <section>
            <h2 className="text-xl font-bold mb-3">Data retention</h2>
            <p>
              We retain information for as long as needed to provide the Service and for legitimate
              or legal purposes. Payment records are retained as required by applicable law and
              Stripe&apos;s policies. Analytics data is retained per Google Analytics&apos; default
              retention settings.
            </p>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="text-xl font-bold mb-3">Your rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, export, or
              delete your personal information, and to object to or restrict certain processing. To
              exercise these rights, contact us at{' '}
              <a href="mailto:finmodelup@gmail.com" className="text-[#4a7c96] hover:underline">
                finmodelup@gmail.com
              </a>
              .
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-xl font-bold mb-3">Security</h2>
            <p>
              We use reasonable technical and organisational measures to protect your information. No
              method of transmission or storage is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-xl font-bold mb-3">Children&apos;s privacy</h2>
            <p>
              MortWise is not directed to children under 13 (or the minimum age required in your
              jurisdiction), and we do not knowingly collect personal information from them. If you
              believe a child has provided us personal information, contact us and we will delete it.
            </p>
          </section>

          {/* International */}
          <section>
            <h2 className="text-xl font-bold mb-3">International users</h2>
            <p>
              Your information may be processed and stored in countries other than your own, which
              may have different data-protection laws. By using the Service you consent to such
              processing.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-bold mb-3">Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be posted
              on this page with a revised effective date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold mb-3">Contact us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{' '}
              <a href="mailto:finmodelup@gmail.com" className="text-[#4a7c96] hover:underline">
                <strong>finmodelup@gmail.com</strong>
              </a>
              .
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
