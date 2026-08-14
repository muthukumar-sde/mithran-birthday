'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin /track page views as visitor logs
    if (pathname === '/track') return;

    // Throttle tracking per session key per path
    const sessionKey = `mithran_visit_${pathname}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const logVisit = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            referrer: document.referrer || 'Direct',
            path: pathname,
            timestamp: new Date().toISOString(),
          }),
        });
        sessionStorage.setItem(sessionKey, 'true');
      } catch (err) {
        console.error('Visitor tracking error:', err);
      }
    };

    logVisit();
  }, [pathname]);

  return null;
}
