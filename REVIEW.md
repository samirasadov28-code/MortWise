# Repairs on review/mortwise-repairs-v2 (draft, not merged)
1. Groq: gpt-oss-120b/20b defaults, low reasoning effort, larger token budgets.
2. Country rules: IE stamp duty (revenue.ie) and 4x/3.5x limits, UK SDLT from 1 Apr 2025, CA tiered deposit, DTI caps (CA 44%, SG 55%, UAE 50%), "regulatory" label only for IE.
3. Checkout: EUR4.99 one-off, 30 days, STRIPE_ONE_OFF_PRICE_ID, fails closed unless active/one_time/EUR/499/tax-inclusive. Paywall override in lib/stripe.ts is untouched (still free for all).
4. AI quota: off unless AI_QUOTA_ENABLED=true; fails closed when on. Migration supabase/migrations/001_ai_rate_budget.sql NOT applied anywhere. Limits come from env.
Open: other markets' stamp duty/DTI, currency-aware default amounts, 0-year term, UK price shown in EUR, typos, LISA/Shared Ownership eligibility display, local-currency price.
