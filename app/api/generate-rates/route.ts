import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MARKETS } from '@/lib/markets';
import { getLenders } from '@/lib/lenders';

// ─── Request / Response schemas ───────────────────────────────────────────────

const ALL_MARKETS = [
  'IE','UK','UAE','US','CN','JP','DE','FR','AU','CA','NL','KR','ES','IT','IN','SG','CH','BR',
  'MX','SA','TR','PL','ID','VN','SE','NO','BE','NZ','AT','DK','FI','PT','GR','CZ','HU','RO',
  'LU','IS','EE','CY','HK','TW','TH','MY','PH','QA','KW','IL','AR','CL','ZA','UA',
] as const;

const RequestSchema = z.object({
  market: z.enum(ALL_MARKETS),
  ltv: z.number().min(0.1).max(1),
  term: z.number().min(5).max(40),
  buyerType: z.enum(['first_time', 'mover', 'investor', 'non_resident']),
  rateStructure: z.enum(['fixed', 'variable', 'split', 'tracker']).optional(),
});

const ScenarioSchema = z.object({
  lenderName: z.string(),
  fixedRate: z.number().optional(),
  fixedPeriodYears: z.number().optional(),
  variableRate: z.number(),
  trackerBaseRate: z.number().optional(),
  trackerMargin: z.number().optional(),
  cashbackPercent: z.number().optional(),
  cashbackClawbackYears: z.number().optional(),
  rateStructure: z.enum(['fixed', 'variable', 'split', 'tracker']),
});

const ResponseSchema = z.object({
  scenarios: z.array(ScenarioSchema),
  disclaimer: z.string(),
});

const SYSTEM_PROMPT = `You are a mortgage data assistant providing estimated rate cards. Return ONLY valid JSON — no prose, no markdown, no explanation. Base your estimates on your knowledge of typical rates in the specified market as of your training data. Always note that these are estimates, not live rates.`;

const marketContext: Record<string, string> = {
  IE: 'Ireland, ECB-based rates, typical range 3.5-4.5% fixed, 4.0-4.5% variable as of 2024-2025',
  UK: 'United Kingdom, Bank of England base rate, typical 2yr fixed ~4.5-5.0%, 5yr fixed ~4.2-4.8%, tracker at BoE+0.5-1.0%',
  UAE: 'UAE, EIBOR-based, typical fixed ~4.5-5.5%, variable at EIBOR+1.5-2.5%',
  US: 'United States, 30yr fixed typical 6.5-7.5%, 15yr fixed ~6.0-7.0%',
  AU: 'Australia, RBA cash rate basis, typical variable ~6.0-6.5%, 2yr fixed ~5.5-6.5%',
  CA: 'Canada, Bank of Canada rate, 5yr fixed typical ~4.5-5.5%, variable at prime-0.5 to prime+0.5',
};

// ─── Provider plumbing ────────────────────────────────────────────────────────

type ProviderName = 'gemini' | 'groq' | 'grok';

type CallResult =
  | { ok: true; text: string }
  | { ok: false; status: number; body: string };

interface ProviderConfig {
  name: ProviderName;
  apiKey: string;
  models: string[];
  /** Run a single completion against this provider. */
  call: (model: string, system: string, user: string, apiKey: string) => Promise<CallResult>;
}

/** OpenAI-compatible providers (Groq, xAI/Grok) share the same wire format. */
async function callOpenAICompat(
  baseUrl: string,
  model: string,
  system: string,
  user: string,
  apiKey: string,
  jsonMode: boolean,
): Promise<CallResult> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { ok: true, text: data.choices?.[0]?.message?.content ?? '' };
}

/** Google Gemini's REST API uses a different shape from OpenAI-compat. */
async function callGemini(
  model: string,
  system: string,
  user: string,
  apiKey: string,
): Promise<CallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        // Force the response to be parseable JSON — Gemini's killer feature
        // for this use case.
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return { ok: true, text };
}

const callGroq = (m: string, s: string, u: string, k: string) =>
  callOpenAICompat('https://api.groq.com/openai/v1', m, s, u, k, true);
const callGrok = (m: string, s: string, u: string, k: string) =>
  callOpenAICompat('https://api.x.ai/v1', m, s, u, k, false);

/**
 * Build the configured-provider list from environment variables.
 * Order is: AI_PROVIDER_ORDER (or default gemini→groq→grok), filtered to those
 * with an API key. If none are configured, the route fails fast with a helpful
 * error mentioning all three env vars.
 */
function buildProviders(): ProviderConfig[] {
  const all: Record<ProviderName, ProviderConfig | null> = {
    gemini: process.env.GEMINI_API_KEY
      ? {
          name: 'gemini',
          apiKey: process.env.GEMINI_API_KEY,
          models: (process.env.GEMINI_MODEL ?? 'gemini-2.0-flash,gemini-2.5-flash,gemini-1.5-flash').split(','),
          call: callGemini,
        }
      : null,
    groq: process.env.GROQ_API_KEY
      ? {
          name: 'groq',
          apiKey: process.env.GROQ_API_KEY,
          models: (process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile,llama-3.1-70b-versatile,llama-3.1-8b-instant').split(','),
          call: callGroq,
        }
      : null,
    grok: process.env.GROK_API_KEY
      ? {
          name: 'grok',
          apiKey: process.env.GROK_API_KEY,
          models: (process.env.GROK_MODEL ?? 'grok-3,grok-3-mini,grok-2-1212,grok-beta').split(','),
          call: callGrok,
        }
      : null,
  };

  const orderEnv = (process.env.AI_PROVIDER_ORDER ?? 'gemini,groq,grok').split(',');
  return orderEnv
    .map((n) => n.trim().toLowerCase() as ProviderName)
    .map((n) => all[n])
    .filter((p): p is ProviderConfig => p !== null);
}

/**
 * Best-effort error detail extraction from a provider's error response body —
 * works for OpenAI-compat (`{error: {message}}`) and Gemini
 * (`{error: {message}}`) and falls back to raw text.
 */
function extractDetail(body: string): string {
  if (!body) return '';
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string };
    if (typeof parsed.error === 'string') return parsed.error;
    if (parsed.error?.message) return parsed.error.message;
  } catch { /* not JSON */ }
  return body.slice(0, 200);
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
            'No AI provider configured. Set GEMINI_API_KEY (recommended, free tier at https://aistudio.google.com), GROQ_API_KEY (free tier at https://console.groq.com), or GROK_API_KEY in your environment variables.',
        },
        { status: 500 },
      );
    }

    const { market, ltv, term, buyerType, rateStructure } = parsed.data;
    const marketName = MARKETS[market]?.name ?? market;
    const currency = MARKETS[market]?.currency ?? '';
    const ctx = marketContext[market] ?? `${marketName} (${currency})`;
    const knownLenders = getLenders(market).map((l) => l.name).join(', ');

    const prompt = `Generate 4 realistic mortgage rate scenarios for a ${marketName} (${market}) buyer.

Context: ${ctx}
Use only these real lenders (pick 4, do not invent banks): ${knownLenders}
LTV: ${(ltv * 100).toFixed(0)}%
Term: ${term} years
Buyer type: ${buyerType}
Preferred rate structure: ${rateStructure ?? 'mixed'}

Return a JSON object with this exact structure:
{
  "scenarios": [
    {
      "lenderName": "string",
      "rateStructure": "fixed"|"variable"|"split"|"tracker",
      "fixedRate": number (0.0380 = 3.80%, only if fixed/split),
      "fixedPeriodYears": number (only if fixed/split),
      "variableRate": number (0.0420 = 4.20%, always required),
      "trackerBaseRate": number (only if tracker, e.g. 0.026),
      "trackerMargin": number (only if tracker, e.g. 0.0095),
      "cashbackPercent": number (optional, e.g. 0.02 = 2%),
      "cashbackClawbackYears": number (optional)
    }
  ],
  "disclaimer": "string explaining these are AI estimates as of training data, not live rates"
}

Include: one 3-5yr fixed, one long fixed (7-10yr), one tracker/variable, one with cashback.
Use realistic rates for the market. All rate values as decimals (0.04 = 4%).`;

    // Try every configured provider in order. Within each provider, try its
    // candidate models in order. Surface a clear error mentioning the provider
    // and model that failed last.
    const errors: string[] = [];
    for (const provider of providers) {
      for (const rawModel of provider.models) {
        const model = rawModel.trim();
        if (!model) continue;
        const result = await provider.call(model, SYSTEM_PROMPT, prompt, provider.apiKey);

        if (!result.ok) {
          const detail = extractDetail(result.body);
          errors.push(`${provider.name}/${model} (${result.status}): ${detail || 'unknown error'}`);
          // Auth / forbidden — different model won't help, skip rest of provider
          if (result.status === 401 || result.status === 403) break;
          // Rate limited — skip rest of provider, try next provider
          if (result.status === 429) break;
          // Otherwise (404 model-not-found, 422 model-invalid, 5xx) try next model
          continue;
        }

        // Got a response — strip any markdown code fences and validate.
        const cleaned = result.text
          .replace(/^```(?:json)?\n?/i, '')
          .replace(/\n?```$/i, '')
          .trim();
        if (!cleaned) {
          errors.push(`${provider.name}/${model}: empty response`);
          continue;
        }
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(cleaned);
        } catch {
          errors.push(`${provider.name}/${model}: response was not valid JSON`);
          continue;
        }
        const validated = ResponseSchema.safeParse(parsedJson);
        if (!validated.success) {
          errors.push(`${provider.name}/${model}: response did not match schema`);
          continue;
        }

        return NextResponse.json({
          ...validated.data,
          provider: provider.name,
          model,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    console.error('All AI providers failed:', errors);
    const lastTwo = errors.slice(-2).join(' · ');
    return NextResponse.json(
      { error: `AI rate generation failed across ${providers.length} provider(s). ${lastTwo}` },
      { status: 502 },
    );
  } catch (error) {
    console.error('generate-rates error:', error);
    return NextResponse.json({ error: 'Rate generation failed' }, { status: 500 });
  }
}
