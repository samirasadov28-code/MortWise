'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScenarioResult, WizardState } from '@/lib/types';
import { MARKETS } from '@/lib/markets';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MortgageChatProps {
  state?: WizardState;
  results?: ScenarioResult[];
  /** If true, hide the floating launcher (used on wizard sheets where space is tight). */
  hidden?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Why is my monthly payment what it is?',
  'How does stamp duty work in this market?',
  'Should I take cashback or a lower rate?',
  'What happens if rates go up by 2%?',
];

export default function MortgageChat({ state, results, hidden }: MortgageChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  function buildContext() {
    if (!state) return undefined;
    const market = MARKETS[state.market];
    const best = results?.length
      ? [...results].sort((a, b) => a.totalAmountPaid - b.totalAmountPaid)[0]
      : undefined;
    return {
      market: state.market,
      marketName: market?.name,
      currency: market?.currency,
      housePrice: state.housePrice || undefined,
      deposit: state.deposit || undefined,
      mortgageTerm: state.mortgageTerm,
      rateStructure: state.rateStructure,
      buyerType: state.buyerType,
      propertyType: state.propertyType,
      bestLender: best?.lenderName,
      bestMonthlyPayment: best?.firstMonthlyPayment,
      bestTotalInterest: best?.totalInterestPaid,
      bestTotalRepaid: best?.totalAmountPaid,
    };
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    setError(null);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: buildContext() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Chat failed (HTTP ${res.status})`);
      } else if (data?.message?.content) {
        setMessages([...newMessages, data.message]);
        if (data.provider) setProvider(data.provider);
      } else {
        setError('Empty response from the assistant.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat request failed');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    setInput('');
  }

  return (
    <>
      {/* Floating launcher — bottom-right, sits above the Feedback button */}
      {!hidden && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask the mortgage assistant"
          className="fixed bottom-20 right-5 z-50 px-4 py-2.5 bg-[#2a2520] hover:bg-[#1a1510] text-white text-sm font-semibold rounded-full shadow-lg transition-colors flex items-center gap-2"
        >
          <span aria-hidden>💬</span>
          Ask MortWise
        </button>
      )}

      {/* Slide-out panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full sm:w-[420px] h-full bg-white border-l border-[#e8e3dc] flex flex-col shadow-2xl"
            role="dialog"
            aria-label="Mortgage assistant chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e3dc] flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-[#2a2520]">Ask MortWise</h2>
                <p className="text-[11px] text-[#6b7a8a]">
                  Mortgage assistant
                  {provider && <> · {provider === 'groq' ? 'Groq' : provider === 'gemini' ? 'Gemini' : 'Grok'}</>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs px-2.5 py-1 border border-[#e8e3dc] hover:border-[#4a7c96] text-[#6b7a8a] hover:text-[#4a7c96] rounded-lg transition-colors"
                  >
                    New chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="text-[#6b7a8a] hover:text-[#4a7c96] text-2xl leading-none px-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-[#2a2520]">
                    Ask anything about your mortgage scenario, country-specific rules,
                    schemes, or the math behind the numbers.
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7a8a]">
                      Try
                    </p>
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => sendMessage(p)}
                        disabled={loading}
                        className="w-full text-left px-3 py-2 text-sm bg-[#f9f7f4] hover:bg-[#eef4f7] border border-[#e8e3dc] hover:border-[#4a7c96] text-[#2a2520] rounded-lg transition-colors disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#6b7a8a]/70 leading-relaxed pt-2">
                    Answers are AI-generated and may be inaccurate. Not financial advice —
                    confirm anything material with a regulated mortgage advisor in your country.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#4a7c96] text-white'
                        : 'bg-[#f9f7f4] text-[#2a2520] border border-[#e8e3dc]'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-lg text-sm bg-[#f9f7f4] text-[#6b7a8a] border border-[#e8e3dc]">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#6b7a8a] rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-[#6b7a8a] rounded-full animate-pulse [animation-delay:200ms]" />
                      <span className="w-1.5 h-1.5 bg-[#6b7a8a] rounded-full animate-pulse [animation-delay:400ms]" />
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-semibold mb-0.5">Couldn&rsquo;t reach the assistant</p>
                  <p>
                    {error.split(/(\bhttps?:\/\/\S+)/g).map((part, i) =>
                      /^https?:\/\//.test(part) ? (
                        <a
                          key={i}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline break-all"
                        >
                          {part}
                        </a>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#e8e3dc] p-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your mortgage…"
                  rows={2}
                  disabled={loading}
                  className="flex-1 resize-none px-3 py-2 text-sm bg-[#f9f7f4] border border-[#e8e3dc] focus:border-[#4a7c96] rounded-lg outline-none transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-[#4a7c96] hover:bg-[#3a6a82] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-[#6b7a8a]/70 mt-1.5">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
