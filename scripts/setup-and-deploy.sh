#!/usr/bin/env bash
# Run once from your local machine to wire up Netlify env vars and deploy.
# Prerequisites: Node.js 18+, a .env.local file in the project root with all keys set.
# Usage: bash scripts/setup-and-deploy.sh

set -e

# Load credentials from .env.local (gitignored)
ENV_FILE="$(dirname "$0")/../.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "✗ .env.local not found at $ENV_FILE"
  echo "  Create it with: NETLIFY_AUTH_TOKEN, GROK_API_KEY, STRIPE_SECRET_KEY,"
  echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_APP_URL"
  exit 1
fi
set -a; source "$ENV_FILE"; set +a

if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  echo "✗ NETLIFY_AUTH_TOKEN not set in .env.local"
  exit 1
fi

SITE_NAME="mortwise"
export NETLIFY_AUTH_TOKEN

echo "→ Linking to mortwise.netlify.app..."
npx netlify link --name "$SITE_NAME"

echo "→ Setting environment variables on Netlify..."
npx netlify env:set GROK_API_KEY                       "$GROK_API_KEY"
npx netlify env:set STRIPE_SECRET_KEY                  "$STRIPE_SECRET_KEY"
npx netlify env:set STRIPE_PUBLISHABLE_KEY             "$STRIPE_PUBLISHABLE_KEY"
npx netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
npx netlify env:set NEXT_PUBLIC_APP_URL                "${NEXT_PUBLIC_APP_URL:-https://mortwise.netlify.app}"

echo "→ Building..."
npm run build

echo "→ Deploying to production..."
npx netlify deploy --prod --dir=.next

echo ""
echo "✓ Done. Visit https://mortwise.netlify.app"
