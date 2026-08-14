import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  action?: string;
}

// In-memory fallback store
let memoryVisits: VisitLogItem[] = [];

let isTableInitialized = false;

async function ensureTableExists(sql: any) {
  if (isTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS visit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        ip TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        country_code TEXT,
        org TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        user_agent TEXT,
        device TEXT,
        browser TEXT,
        os_name TEXT,
        screen TEXT,
        language TEXT,
        referrer TEXT,
        path TEXT,
        action TEXT
      );
    `;
    isTableInitialized = true;
  } catch (err) {
    console.error('Failed to create visit_logs table:', err);
  }
}

function getTargetLogFilePaths(): string[] {
  const paths: string[] = [];
  try {
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    paths.push(path.join(publicDataDir, 'visits.json'));
  } catch {}

  try {
    const publicDir = path.join(process.cwd(), 'public');
    paths.push(path.join(publicDir, 'visits.json'));
  } catch {}

  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    paths.push(path.join(localDir, 'visits.json'));
  } catch {}

  paths.push(path.join(os.tmpdir(), 'mithran_visits.json'));
  return paths;
}

function readLogVisits(): VisitLogItem[] {
  const filePaths = getTargetLogFilePaths();
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryVisits = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return memoryVisits;
}

function saveLogVisits(visits: VisitLogItem[]) {
  memoryVisits = visits;
  const jsonString = JSON.stringify(visits.slice(0, 1000), null, 2);
  const filePaths = getTargetLogFilePaths();
  for (const filePath of filePaths) {
    try {
      fs.writeFileSync(filePath, jsonString, 'utf-8');
    } catch {}
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
  const sql = getSql();
  if (sql) {
    try {
      await ensureTableExists(sql);
      const rows = await sql`
        SELECT 
          id,
          timestamp,
          ip,
          city,
          region,
          country,
          country_code AS "countryCode",
          org,
          latitude,
          longitude,
          user_agent AS "userAgent",
          device,
          browser,
          os_name AS "osName",
          screen,
          language,
          referrer,
          path,
          action
        FROM visit_logs 
        ORDER BY timestamp DESC 
        LIMIT 1000
      `;

      return NextResponse.json(
        {
          success: true,
          total: rows.length,
          visits: rows as VisitLogItem[],
          source: 'neon',
        },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
          },
        }
      );
    } catch (err) {
      console.error('Neon DB GET error:', err);
    }
  }

  // Fallback to local logs
  const visits = readLogVisits();
  return NextResponse.json(
    {
      success: true,
      total: visits.length,
      visits,
      source: 'local',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    }
  );
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
      action: body.action || 'Site Visit',
    };

    const sql = getSql();
    let savedToDb = false;

    if (sql) {
      try {
        await ensureTableExists(sql);
        await sql`
          INSERT INTO visit_logs (
            id, timestamp, ip, city, region, country, country_code, org,
            latitude, longitude, user_agent, device, browser, os_name,
            screen, language, referrer, path, action
          ) VALUES (
            ${logData.id},
            ${logData.timestamp},
            ${logData.ip},
            ${logData.city},
            ${logData.region},
            ${logData.country},
            ${logData.countryCode},
            ${logData.org},
            ${logData.latitude},
            ${logData.longitude},
            ${logData.userAgent},
            ${logData.device},
            ${logData.browser},
            ${logData.osName},
            ${logData.screen},
            ${logData.language},
            ${logData.referrer},
            ${logData.path},
            ${logData.action}
          )
        `;
        savedToDb = true;
      } catch (err) {
        console.error('Neon DB POST error:', err);
      }
    }

    // Always keep memory & file in sync as backup
    const freshVisits = readLogVisits();
    const updatedVisits = [logData, ...freshVisits];
    saveLogVisits(updatedVisits);

    return NextResponse.json({
      success: true,
      log: logData,
      source: savedToDb ? 'neon' : 'local',
    });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to record log' }, { status: 500 });
  }
}

// DELETE: Clear all stored logs
export async function DELETE() {
  const sql = getSql();
  if (sql) {
    try {
      await ensureTableExists(sql);
      await sql`TRUNCATE TABLE visit_logs`;
    } catch (err) {
      console.error('Neon DB DELETE error:', err);
    }
  }

  saveLogVisits([]);
  return NextResponse.json({ success: true, message: 'All visitor logs cleared' });
}
