interface AIRateBannerProps {
  generatedAt?: string;
  disclaimer?: string;
}

export default function AIRateBanner({ generatedAt, disclaimer }: AIRateBannerProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-950/30 border border-amber-600/30 rounded-lg">
      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-600/20 text-amber-400 border border-amber-600/30">
        AI est.
      </span>
      <div className="text-xs text-amber-300/80">
        <p className="font-medium">Rates are AI-estimated, not live market data</p>
        {disclaimer && <p className="mt-0.5 text-amber-300/60">{disclaimer}</p>}
        {generatedAt && (
          <p className="mt-0.5 text-amber-300/50">Generated: {new Date(generatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-600/20 text-amber-400 border border-amber-600/30">
      AI est.
    </span>
  );
}
