import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const RequestSchema = z.object({
  market: z.enum(['IE', 'UK', 'UAE', 'US', 'AU', 'CA']),
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

    const { market, ltv, term, buyerType, rateStructure } = parsed.data;
    const ctx = marketContext[market] ?? market;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Generate 4 realistic mortgage rate scenarios for a ${market} buyer.

Context: ${ctx}
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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });
    }

    let jsonText = rawContent.text.trim();
    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed2: unknown;
    try {
      parsed2 = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'AI response was not valid JSON' }, { status: 500 });
    }

    const validated = ResponseSchema.safeParse(parsed2);
    if (!validated.success) {
      return NextResponse.json({ error: 'AI response did not match expected schema' }, { status: 500 });
    }

    return NextResponse.json({
      ...validated.data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('generate-rates error:', error);
    return NextResponse.json(
      { error: 'Rate generation failed' },
      { status: 500 }
    );
  }
}
