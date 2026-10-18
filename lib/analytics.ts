/**
 * Lightweight wrapper around the GA4 gtag global. Lets the rest of the app
 * fire well-known funnel events without sprinkling `(window as any).gtag`
 * checks everywhere. No-ops on the server and when the GA snippet hasn't
 * loaded yet.
 */

type GtagFn = (
  command: 'event',
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export type FunnelEvent =
  | 'wizard_step_completed'
  | 'wizard_calculate_clicked'
  | 'unlock_clicked'
  | 'checkout_started'
  | 'checkout_succeeded'
  | 'pdf_exported'
  | 'chat_question_sent'
  | 'chat_request_failed'
  | 'rate_generation_succeeded'
  | 'rate_generation_failed'
  | 'affordability_calculated'
  | 'affordability_handoff'
  | 'scenario_saved'
  | 'scenarios_exported'
  | 'scenarios_imported';

export function track(
  event: FunnelEvent,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === 'undefined') return;
  // gtag is loaded via <Script> in app/layout.tsx; if it hasn't initialised
  // yet (race during early page load), still push to the dataLayer so GA can
  // pick it up once gtag attaches.
  const fn = window.gtag;
  if (typeof fn === 'function') {
    fn('event', event, params);
    return;
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...params });
  }
}
