'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/track') return;

    const sessionKey = `mithran_visit_${pathname}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const logVisit = async () => {
      let clientGeoData: Record<string, unknown> = {};

      // 1. Try ipapi.co (CORS / Free Browser Geolocation)
      try {
        const geoRes = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const data = await geoRes.json();
          if (data && data.city) {
            clientGeoData = {
              clientIp: data.ip,
              city: data.city,
              region: data.region,
              country: data.country_name,
              countryCode: data.country_code,
              org: data.org || data.asn,
              latitude: data.latitude,
              longitude: data.longitude,
            };
          }
        }
      } catch {
        // Fallback silently if blocked
      }

      // 2. Fallback to ipwho.is (100% CORS-friendly free browser location API)
      if (!clientGeoData.city) {
        try {
          const geoRes2 = await fetch('https://ipwho.is/', {
            signal: AbortSignal.timeout(3000),
          });
          if (geoRes2.ok) {
            const data2 = await geoRes2.json();
            if (data2 && data2.success && data2.city) {
              clientGeoData = {
                clientIp: data2.ip,
                city: data2.city,
                region: data2.region,
                country: data2.country,
                countryCode: data2.country_code,
                org: data2.connection?.isp || data2.connection?.org || '',
                latitude: data2.latitude,
                longitude: data2.longitude,
              };
            }
          }
        } catch {
          // Fallback silently
        }
      }

      try {
        await fetch('/api/track', {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...clientGeoData,
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
