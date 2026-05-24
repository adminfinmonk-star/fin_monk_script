'use client';

import { useEffect } from 'react';
import { initPostHog, trackPageView, trackDeviceInfo, trackSessionWithUTM } from '@/lib/posthog';
import { getCapturedUTM } from '@/lib/utm';

type ClarityWindow = Window & Record<string, unknown>;

/**
 * Initialize both PostHog and Microsoft Clarity on page load
 * Tracks device info, UTM parameters, and page views
 */
export default function AnalyticsInit() {
  useEffect(() => {
    // Initialize PostHog
    initPostHog();

    // Initialize Microsoft Clarity
    initClarity();

    // Track page view
    trackPageView();

    // Track device info
    trackDeviceInfo();

    // Track UTM session
    const utm = getCapturedUTM();
    if (utm) {
      trackSessionWithUTM(utm);
    }
  }, []);

  return null;
}

/**
 * Initialize Microsoft Clarity using official snippet pattern.
 * Sets up stub queue before script loads so no events are lost.
 */
function initClarity() {
  if (typeof window === 'undefined') return;

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!clarityId) {
    console.log('[Clarity] No ID configured');
    return;
  }

  // Official Clarity snippet
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions */
  void (function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] = c[a] || function (...args: unknown[]) {
      const queue = (c[a].q = c[a].q || []) as unknown[];
      queue.push(args);
    };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window as unknown as ClarityWindow, document, 'clarity', 'script', clarityId);
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions */
}
