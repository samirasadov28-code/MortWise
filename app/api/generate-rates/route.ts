import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MARKETS } from '@/lib/markets';
import { getLenders } from '@/lib/lenders';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Grok API key not configured' }, { status: 500 });
    }

    const { market, ltv, term, buyerType, rateStructure } = parsed.data;
    const marketName = MARKETS[market]?.name ?? market;
    const currency = MARKETS[market]?.currency ?? '';
    const ctx = marketContext[market] ?? `${marketName} (${currency})`;
    // Pass our hand-curated lender list to the model so it returns names of real
    // banks the user already sees in Step 5, instead of inventing fictional ones.
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

    // Try the candidate models in order. xAI returns 404 for model-not-found
    // sometimes and 422 for "invalid model" / "model not available to your
    // tier" other times — both should fall through to the next candidate.
    // 401/403/429 won't be fixed by changing the model, so fail fast on those.
    // Override the list via GROK_MODEL env (comma-separated).
    const modelCandidates = (
      process.env.GROK_MODEL ?? 'grok-3,grok-3-mini,grok-2-1212,grok-beta'
    ).split(',');
    let response: Response | null = null;
    let lastErrorBody = '';
    let lastStatus = 0;
    for (const raw of modelCandidates) {
      const model = raw.trim();
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });
      if (response.ok) break;
      lastStatus = response.status;
      lastErrorBody = await response.text();
      const looksLikeModelIssue =
        response.status === 404 ||
        response.status === 422 ||
        /model/i.test(lastErrorBody);
      // Fail fast on auth / quota / rate-limit — different model won't help.
      if (!looksLikeModelIssue) break;
    }

    if (!response || !response.ok) {
      console.error('Grok API error:', lastStatus, lastErrorBody);
      // Pull the underlying message out so the user sees a useful reason.
      let detail = lastErrorBody.slice(0, 200);
      try {
        const parsedErr = JSON.parse(lastErrorBody) as { error?: { message?: string } | string };
        if (typeof parsedErr.error === 'string') detail = parsedErr.error;
        else if (parsedErr.error?.message) detail = parsedErr.error.message;
      } catch { /* not JSON */ }
      return NextResponse.json(
        { error: `Grok API request failed${detail ? `: ${detail}` : ''}` },
        { status: 502 },
      );
    }

    const grokData = await response.json();
    let jsonText: string = grokData.choices?.[0]?.message?.content ?? '';
    if (!jsonText) {
      return NextResponse.json({ error: 'Empty response from Grok' }, { status: 500 });
    }

    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed2: unknown;
    try {
      parsed2 = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'Grok response was not valid JSON' }, { status: 500 });
    }

    const validated = ResponseSchema.safeParse(parsed2);
    if (!validated.success) {
      return NextResponse.json({ error: 'Grok response did not match expected schema' }, { status: 500 });
    }

    return NextResponse.json({
      ...validated.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('generate-rates error:', error);
    return NextResponse.json({ error: 'Rate generation failed' }, { status: 500 });
  }
}
