interface AIRateBannerProps {
  generatedAt?: string;
  disclaimer?: string;
  provider?: string;
  model?: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  groq: 'Groq',
  grok: 'xAI Grok',
};

export default function AIRateBanner({ generatedAt, disclaimer, provider, model }: AIRateBannerProps) {
  const providerLabel = provider ? PROVIDER_LABELS[provider] ?? provider : null;
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
        AI est.
      </span>
      <div className="text-xs text-amber-700">
        <p className="font-medium">Rates are AI-estimated, not live market data</p>
        {disclaimer && <p className="mt-0.5 text-amber-600">{disclaimer}</p>}
        {generatedAt && (
          <p className="mt-0.5 text-amber-500">
            Generated: {new Date(generatedAt).toLocaleString()}
            {providerLabel && <> · via {providerLabel}{model ? ` (${model})` : ''}</>}
          </p>
        )}
      </div>
    </div>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
      AI est.
    </span>
  );
}
