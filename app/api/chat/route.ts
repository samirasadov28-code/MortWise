import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Request schema ───────────────────────────────────────────────────────────

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const ContextSchema = z
  .object({
    market: z.string().optional(),
    marketName: z.string().optional(),
    currency: z.string().optional(),
    housePrice: z.number().optional(),
    deposit: z.number().optional(),
    mortgageTerm: z.number().optional(),
    rateStructure: z.string().optional(),
    buyerType: z.string().optional(),
    propertyType: z.string().optional(),
    bestLender: z.string().optional(),
    bestMonthlyPayment: z.number().optional(),
    bestTotalInterest: z.number().optional(),
    bestTotalRepaid: z.number().optional(),
  })
  .optional();

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  context: ContextSchema,
});

// ─── Provider plumbing (shared shape with /api/generate-rates) ────────────────

type ProviderName = 'groq' | 'gemini' | 'grok';
type CallResult =
  | { ok: true; text: string }
  | { ok: false; status: number; body: string };

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProviderConfig {
  name: ProviderName;
  apiKey: string;
  models: string[];
  call: (model: string, messages: ChatMessage[], apiKey: string) => Promise<CallResult>;
}

async function callOpenAICompat(
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  apiKey: string,
): Promise<CallResult> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.4,
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { ok: true, text: data.choices?.[0]?.message?.content ?? '' };
}

async function callGemini(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
): Promise<CallResult> {
  // Convert OpenAI-style messages → Gemini's contents+systemInstruction shape.
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const turns = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents: turns,
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return { ok: true, text };
}

const callGroq = (m: string, msgs: ChatMessage[], k: string) =>
  callOpenAICompat('https://api.groq.com/openai/v1', m, msgs, k);
const callGrok = (m: string, msgs: ChatMessage[], k: string) =>
  callOpenAICompat('https://api.x.ai/v1', m, msgs, k);

function buildProviders(): ProviderConfig[] {
  // For chat, default order is Groq first (fastest, free, decent quality on
  // Llama 3.3 70B). Fall back to Gemini, then Grok. Override via
  // CHAT_PROVIDER_ORDER or AI_PROVIDER_ORDER if you have a preference.
  const all: Record<ProviderName, ProviderConfig | null> = {
    groq: process.env.GROQ_API_KEY
      ? {
          name: 'groq',
          apiKey: process.env.GROQ_API_KEY,
          models: (
            process.env.GROQ_CHAT_MODEL ??
            process.env.GROQ_MODEL ??
            'llama-3.3-70b-versatile,llama-3.1-70b-versatile,llama-3.1-8b-instant'
          ).split(','),
          call: callGroq,
        }
      : null,
    gemini: process.env.GEMINI_API_KEY
      ? {
          name: 'gemini',
          apiKey: process.env.GEMINI_API_KEY,
          models: (
            process.env.GEMINI_CHAT_MODEL ??
            process.env.GEMINI_MODEL ??
            'gemini-2.0-flash,gemini-2.5-flash,gemini-1.5-flash'
          ).split(','),
          call: callGemini,
        }
      : null,
    grok: process.env.GROK_API_KEY
      ? {
          name: 'grok',
          apiKey: process.env.GROK_API_KEY,
          models: (process.env.GROK_MODEL ?? 'grok-3,grok-3-mini,grok-2-1212').split(','),
          call: callGrok,
        }
      : null,
  };
  const orderEnv = (
    process.env.CHAT_PROVIDER_ORDER ??
    process.env.AI_PROVIDER_ORDER ??
    'groq,gemini,grok'
  ).split(',');
  return orderEnv
    .map((n) => n.trim().toLowerCase() as ProviderName)
    .map((n) => all[n])
    .filter((p): p is ProviderConfig => p !== null);
}

function extractDetail(body: string): string {
  if (!body) return '';
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string };
    if (typeof parsed.error === 'string') return parsed.error;
    if (parsed.error?.message) return parsed.error.message;
  } catch { /* not JSON */ }
  return body.slice(0, 200);
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `You are MortWise's in-app mortgage assistant. Help users understand their mortgage, taxes, schemes, lender options, and the math behind their numbers across 50+ housing markets.

Style:
- Be concise: 1–3 short paragraphs unless the user asks for more depth.
- Use plain language. Avoid jargon; when you must use a term, define it briefly.
- When the user references "my mortgage", "my scenario", "my monthly payment" etc., use the context block below.
- Never invent live rates, current regulations, or specific bank policies you don't know. If you don't know, say so and suggest where they could find the answer (lender website, central bank, ministry of finance, etc.).
- General mortgage math (annuity formulas, LTV, total interest, stamp duty bands you know about) is fair game.
- Do not provide regulated financial advice — describe options, trade-offs, and let the user decide. Add "this isn't financial advice" when discussing decisions.`;

function buildSystemPrompt(context: z.infer<typeof ContextSchema>): string {
  if (!context) return SYSTEM_PROMPT_BASE;
  const fmt = (n?: number) =>
    n === undefined ? undefined : new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 }).format(n);
  const lines = [
    context.marketName && `Market: ${context.marketName}${context.market ? ` (${context.market})` : ''}`,
    context.currency && `Currency: ${context.currency}`,
    context.buyerType && `Buyer type: ${context.buyerType.replace('_', ' ')}`,
    context.propertyType && `Property type: ${context.propertyType.replace('_', ' ')}`,
    context.housePrice !== undefined && `Property price: ${fmt(context.housePrice)} ${context.currency ?? ''}`.trim(),
    context.deposit !== undefined && `Deposit: ${fmt(context.deposit)} ${context.currency ?? ''}`.trim(),
    context.mortgageTerm && `Term: ${context.mortgageTerm} years`,
    context.rateStructure && `Rate structure: ${context.rateStructure}`,
    context.bestLender && `Best lender (lowest total cost): ${context.bestLender}`,
    context.bestMonthlyPayment !== undefined &&
      `Best first monthly payment: ${fmt(context.bestMonthlyPayment)} ${context.currency ?? ''}`.trim(),
    context.bestTotalInterest !== undefined &&
      `Best total interest over loan life: ${fmt(context.bestTotalInterest)} ${context.currency ?? ''}`.trim(),
    context.bestTotalRepaid !== undefined &&
      `Best total amount repaid: ${fmt(context.bestTotalRepaid)} ${context.currency ?? ''}`.trim(),
  ].filter(Boolean);
  if (lines.length === 0) return SYSTEM_PROMPT_BASE;
  return `${SYSTEM_PROMPT_BASE}\n\nCurrent user scenario:\n${lines.join('\n')}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const providers = buildProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        {
          error:
            'Chat is unavailable — no AI provider configured. Set GROQ_API_KEY (recommended, free tier at https://console.groq.com), GEMINI_API_KEY, or GROK_API_KEY.',
        },
        { status: 503 },
      );
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(parsed.data.context) },
      ...parsed.data.messages,
    ];

    const errors: string[] = [];
    for (const provider of providers) {
      for (const rawModel of provider.models) {
        const model = rawModel.trim();
        if (!model) continue;
        const result = await provider.call(model, messages, provider.apiKey);

        if (!result.ok) {
          const detail = extractDetail(result.body);
          errors.push(`${provider.name}/${model} (${result.status}): ${detail || 'unknown'}`);
          if (result.status === 401 || result.status === 403) break;
          if (result.status === 429) break;
          continue;
        }
        const text = result.text.trim();
        if (!text) {
          errors.push(`${provider.name}/${model}: empty response`);
          continue;
        }
        return NextResponse.json({
          message: { role: 'assistant', content: text },
          provider: provider.name,
          model,
        });
      }
    }

    console.error('All chat providers failed:', errors);
    const lastTwo = errors.slice(-2).join(' · ');
    return NextResponse.json(
      { error: `Chat failed across ${providers.length} provider(s). ${lastTwo}` },
      { status: 502 },
    );
  } catch (error) {
    console.error('chat error:', error);
    return NextResponse.json({ error: 'Chat request failed' }, { status: 500 });
  }
}
