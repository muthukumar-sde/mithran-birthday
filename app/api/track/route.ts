import { NextRequest, NextResponse } from 'next/server';
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

// In-memory store for fast serverless serving
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

function readLogVisits(): VisitLogItem[] {
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
    console.error('Error reading visits log file:', err);
  }
  return memoryVisits;
}

function saveLogVisits(visits: VisitLogItem[]) {
  memoryVisits = visits;
  try {
    const filePath = getLogFilePath();
    fs.writeFileSync(filePath, JSON.stringify(visits.slice(0, 1000), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing visits log file:', err);
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

// GET: Return all stored visitor logs for /track table
export async function GET() {
  const visits = readLogVisits();
  return NextResponse.json({
    success: true,
    total: visits.length,
    visits,
  });
}

// POST: Record a new visitor in log file
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

    // Vercel Geolocation headers
    let city = body.city || (req.headers.get('x-vercel-ip-city') ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!) : '');
    let country = body.country || req.headers.get('x-vercel-ip-country') || '';
    let region = body.region || (req.headers.get('x-vercel-ip-country-region') ? decodeURIComponent(req.headers.get('x-vercel-ip-country-region')!) : '');
    let countryCode = body.countryCode || country;
    let org = body.org || '';
    let latitude = body.latitude || null;
    let longitude = body.longitude || null;

    const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');

    // If city not set and public IP, query ip-api
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

    if (isLocalIp && (!city || city === 'Unknown City')) {
      city = 'Chennai';
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

    const freshVisits = readLogVisits();
    const updatedVisits = [logData, ...freshVisits];
    saveLogVisits(updatedVisits);

    return NextResponse.json({
      success: true,
      log: logData,
    });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record log' }, { status: 500 });
  }
}

// DELETE: Clear all stored logs
export async function DELETE() {
  saveLogVisits([]);
  return NextResponse.json({ success: true, message: 'All visitor logs cleared' });
}
