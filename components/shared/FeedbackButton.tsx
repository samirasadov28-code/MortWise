'use client';

import { useState } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  function handleClose() {
    setOpen(false);
    setTimeout(() => setSubmitState('idle'), 300);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (res.ok) {
        setSubmitState('success');
        form.reset();
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-full shadow-lg transition-colors"
        aria-label="Send feedback"
      >
        Feedback
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="w-full max-w-md bg-[#16213e] border border-[#1e3a5f] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Send feedback</h2>
              <button
                onClick={handleClose}
                className="text-[#94a3b8] hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {submitState === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-white font-semibold mb-1">Thanks for the feedback!</p>
                <p className="text-sm text-[#94a3b8]">We read every message.</p>
                <button
                  onClick={handleClose}
                  className="mt-5 px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                name="mortwise-feedback"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
              >
                {/* Netlify hidden fields */}
                <input type="hidden" name="form-name" value="mortwise-feedback" />
                <input type="hidden" name="bot-field" className="hidden" />

                <div className="mb-4">
                  <label className="block text-sm text-[#94a3b8] mb-1.5" htmlFor="feedback-email">
                    Email <span className="text-[#94a3b8]/60">(optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 bg-[#0f1929] border border-[#1e3a5f] focus:border-[#3b82f6] rounded-lg text-white text-sm placeholder-[#94a3b8]/50 outline-none transition-colors"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-[#94a3b8] mb-1.5" htmlFor="feedback-type">
                    Type
                  </label>
                  <select
                    id="feedback-type"
                    name="type"
                    required
                    className="w-full px-3 py-2.5 bg-[#0f1929] border border-[#1e3a5f] focus:border-[#3b82f6] rounded-lg text-white text-sm outline-none transition-colors"
                  >
                    <option value="">Select…</option>
                    <option value="bug">Bug report</option>
                    <option value="feature">Feature request</option>
                    <option value="question">Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm text-[#94a3b8] mb-1.5" htmlFor="feedback-message">
                    Message
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="Tell us what's on your mind…"
                    className="w-full px-3 py-2.5 bg-[#0f1929] border border-[#1e3a5f] focus:border-[#3b82f6] rounded-lg text-white text-sm placeholder-[#94a3b8]/50 outline-none transition-colors resize-none"
                  />
                </div>

                {submitState === 'error' && (
                  <p className="text-red-400 text-sm mb-3">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {submitState === 'submitting' ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
