import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface VisitLog {
  id: string;
  timestamp: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
  userAgent: string;
  device: string;
  browser: string;
  osName: string;
  screen: string;
  language: string;
  referrer: string;
  path: string;
}

// Memory cache fallback
let memoryVisits: VisitLog[] = [];

// Determine persistent log file path
function getLogFilePath(): string {
  // Try project data directory first, fallback to OS tmp directory
  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'visits.json');
  } catch {
    return path.join(os.tmpdir(), 'mithran_visits.json');
  }
}

function readVisits(): VisitLog[] {
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
    console.error('Error reading visits log:', err);
  }
  return memoryVisits;
}

function saveVisits(visits: VisitLog[]) {
  memoryVisits = visits;
  try {
    const filePath = getLogFilePath();
    fs.writeFileSync(filePath, JSON.stringify(visits.slice(0, 1000), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing visits log:', err);
  }
}

// User Agent parser helpers
function parseUserAgent(ua: string) {
  let device = 'Desktop';
  let browser = 'Unknown Browser';
  let osName = 'Unknown OS';

  // Device
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  // OS
  if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/android/i.test(ua)) osName = 'Android';
  else if (/windows/i.test(ua)) osName = 'Windows';
  else if (/linux/i.test(ua)) osName = 'Linux';

  // Browser
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { device, browser, osName };
}

// GET: Return all logged visits
export async function GET() {
  const visits = readVisits();
  return NextResponse.json({
    success: true,
    total: visits.length,
    visits,
  });
}

// POST: Log a new visitor visit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract headers
    const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const rawIp = forwardedFor.split(',')[0].trim() || '127.0.0.1';

    // Clean IP for display/lookup
    const ip = rawIp.replace(/^::ffff:/, '');

    // Vercel Geolocation headers
    let city = req.headers.get('x-vercel-ip-city') ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!) : '';
    let country = req.headers.get('x-vercel-ip-country') || '';
    let region = req.headers.get('x-vercel-ip-country-region') || '';
    let countryCode = country;
    let org = '';

    // If Vercel geolocation headers not present and IP is public, fetch IP info via ip-api
    const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');

    if ((!city || !country) && !isLocalIp) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,org`, {
          signal: AbortSignal.timeout(2500),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.status === 'success') {
            city = city || geoData.city || '';
            country = country || geoData.country || '';
            countryCode = countryCode || geoData.countryCode || '';
            region = region || geoData.regionName || '';
            org = geoData.org || '';
          }
        }
      } catch {
        // Fallback silently if geo lookup fails
      }
    }

    if (isLocalIp) {
      city = city || 'Localhost';
      country = country || 'Development';
      countryCode = countryCode || 'DEV';
    }

    const userAgent = body.userAgent || req.headers.get('user-agent') || 'Unknown';
    const parsedUa = parseUserAgent(userAgent);

    const newLog: VisitLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: body.timestamp || new Date().toISOString(),
      ip: ip || 'Unknown IP',
      city: city || 'Unknown City',
      region: region || 'Unknown Region',
      country: country || 'Unknown Country',
      countryCode: countryCode || 'XX',
      org: org || 'Unknown ISP',
      userAgent,
      device: parsedUa.device,
      browser: parsedUa.browser,
      osName: parsedUa.osName,
      screen: body.screen || 'Unknown',
      language: body.language || req.headers.get('accept-language')?.split(',')[0] || 'Unknown',
      referrer: body.referrer || 'Direct',
      path: body.path || '/',
    };

    const currentVisits = readVisits();
    const updatedVisits = [newLog, ...currentVisits];
    saveVisits(updatedVisits);

    return NextResponse.json({ success: true, log: newLog });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record log' }, { status: 500 });
  }
}

// DELETE: Clear all logs (for admin reset)
export async function DELETE() {
  saveVisits([]);
  return NextResponse.json({ success: true, message: 'Logs cleared' });
}
