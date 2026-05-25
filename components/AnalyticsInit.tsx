'use client';

import { useEffect } from 'react';
import { initPostHog, trackPageView, trackDeviceInfo, trackSessionWithUTM } from '@/lib/posthog';
import { getCapturedUTM } from '@/lib/utm';

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
      // cast to a plain record to satisfy trackSessionWithUTM's parameter shape
      trackSessionWithUTM(utm as unknown as Record<string, string>);
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
  (function (c: any, l: any, a: string, r: string, i: string) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    const t: any = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);
}
