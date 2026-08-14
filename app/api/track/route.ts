import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface VisitLogItem {
  id: string;
  timestamp: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
  latitude?: number | null;
  longitude?: number | null;
  userAgent: string;
  device: string;
  browser: string;
  osName: string;
  screen: string;
  language: string;
  referrer: string;
  path: string;
}

// Memory fallback store
let memoryVisits: VisitLogItem[] = [];

function getLogFilePath(): string {
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'visits.json');
  } catch {
    return path.join(os.tmpdir(), 'mithran_visits.json');
  }
}

function readFallbackVisits(): VisitLogItem[] {
  try {
    const filePath = getLogFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryVisits = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading fallback visits:', err);
  }
  return memoryVisits;
}

function saveFallbackVisits(visits: VisitLogItem[]) {
  memoryVisits = visits;
  try {
    const filePath = getLogFilePath();
    fs.writeFileSync(filePath, JSON.stringify(visits.slice(0, 1000), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback visits:', err);
  }
}

function parseUserAgent(ua: string) {
  let device = 'Desktop';
  let browser = 'Unknown Browser';
  let osName = 'Unknown OS';

  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/windows/i.test(ua)) osName = 'Windows';
  else if (/linux/i.test(ua)) osName = 'Linux';

  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { device, browser, osName };
}

// GET: Return all visitor logs (from Prisma DB if connected, else fallback)
export async function GET() {
  try {
    if (!prisma) {
      throw new Error('Prisma client not available');
    }
    // Try querying Prisma DB
    const dbVisits = await prisma.visitLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const visits: VisitLogItem[] = dbVisits.map((item) => ({
      id: item.id,
      timestamp: item.timestamp,
      ip: item.ip,
      city: item.city,
      region: item.region,
      country: item.country,
      countryCode: item.countryCode,
      org: item.org,
      latitude: item.latitude,
      longitude: item.longitude,
      userAgent: item.userAgent,
      device: item.device,
      browser: item.browser,
      osName: item.osName,
      screen: item.screen,
      language: item.language,
      referrer: item.referrer,
      path: item.path,
    }));

    return NextResponse.json({
      success: true,
      source: 'prisma',
      total: visits.length,
      visits,
    });
  } catch (err) {
    console.warn('Prisma DB query failed, falling back to memory/file store:', err);
    const fallback = readFallbackVisits();
    return NextResponse.json({
      success: true,
      source: 'fallback',
      total: fallback.length,
      visits: fallback,
    });
  }
}

// POST: Record a new visitor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract Real Client IP from headers
    const forwardedFor =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-vercel-forwarded-for') ||
      '';
    
    let rawIp = forwardedFor.split(',')[0].trim();
    if (!rawIp || rawIp === '127.0.0.1' || rawIp === '::1') {
      rawIp = body.clientIp || rawIp || '127.0.0.1';
    }

    const ip = rawIp.replace(/^::ffff:/, '');

    // Vercel Geolocation headers (automatically populated on Vercel)
    let city = body.city || (req.headers.get('x-vercel-ip-city') ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!) : '');
    let country = body.country || req.headers.get('x-vercel-ip-country') || '';
    let region = body.region || (req.headers.get('x-vercel-ip-country-region') ? decodeURIComponent(req.headers.get('x-vercel-ip-country-region')!) : '');
    let countryCode = body.countryCode || country;
    let org = body.org || '';
    let latitude = body.latitude || null;
    let longitude = body.longitude || null;

    const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');

    // If city/country not captured yet and public IP, fetch real location via ip-api
    if ((!city || city === 'Unknown City') && !isLocalIp) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,org,lat,lon`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.status === 'success') {
            city = geoData.city || city || 'Unknown City';
            country = geoData.country || country || 'Unknown Country';
            countryCode = geoData.countryCode || countryCode || 'XX';
            region = geoData.regionName || region || '';
            org = geoData.org || '';
            latitude = geoData.lat || null;
            longitude = geoData.lon || null;
          }
        }
      } catch {
        // Fallback silently
      }
    }

    if (isLocalIp && !city) {
      city = 'Chennai (Dev)';
      country = 'India';
      countryCode = 'IN';
      region = 'Tamil Nadu';
    }

    const userAgent = body.userAgent || req.headers.get('user-agent') || 'Unknown';
    const parsedUa = parseUserAgent(userAgent);
    const timestamp = body.timestamp || new Date().toISOString();

    const logData: VisitLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp,
      ip: ip || 'Unknown IP',
      city: city || 'Unknown City',
      region: region || 'Unknown Region',
      country: country || 'Unknown Country',
      countryCode: countryCode || 'XX',
      org: org || 'Unknown ISP',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      userAgent,
      device: parsedUa.device,
      browser: parsedUa.browser,
      osName: parsedUa.osName,
      screen: body.screen || 'Unknown',
      language: body.language || req.headers.get('accept-language')?.split(',')[0] || 'Unknown',
      referrer: body.referrer || 'Direct',
      path: body.path || '/',
    };

    // Save to Prisma DB if available
    let dbSuccess = false;
    if (prisma) {
      try {
        await prisma.visitLog.create({
          data: {
            timestamp: logData.timestamp,
            ip: logData.ip,
            city: logData.city,
            region: logData.region,
            country: logData.country,
            countryCode: logData.countryCode,
            org: logData.org,
            latitude: logData.latitude,
            longitude: logData.longitude,
            userAgent: logData.userAgent,
            device: logData.device,
            browser: logData.browser,
            osName: logData.osName,
            screen: logData.screen,
            language: logData.language,
            referrer: logData.referrer,
            path: logData.path,
          },
        });
        dbSuccess = true;
      } catch (dbErr) {
        console.warn('Prisma save failed, using fallback storage:', dbErr);
      }
    }

    // Always update fallback memory/file store as safety net
    const currentFallback = readFallbackVisits();
    saveFallbackVisits([logData, ...currentFallback]);

    return NextResponse.json({
      success: true,
      dbSaved: dbSuccess,
      log: logData,
    });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record log' }, { status: 500 });
  }
}

// DELETE: Clear all logs
export async function DELETE() {
  if (prisma) {
    try {
      await prisma.visitLog.deleteMany({});
    } catch {
      // Ignore if Prisma DB not initialized
    }
  }
  saveFallbackVisits([]);
  return NextResponse.json({ success: true, message: 'All logs cleared' });
}
