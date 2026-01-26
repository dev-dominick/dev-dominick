import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Parse user agent string to extract device/browser/os info
function parseUserAgent(ua: string) {
  // Device detection
  let device = 'desktop';
  if (/mobile/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'tablet';

  // Browser detection
  let browser = 'unknown';
  if (/edg/i.test(ua)) browser = 'edge';
  else if (/chrome/i.test(ua)) browser = 'chrome';
  else if (/safari/i.test(ua)) browser = 'safari';
  else if (/firefox/i.test(ua)) browser = 'firefox';

  // OS detection
  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'windows';
  else if (/mac/i.test(ua)) os = 'macos';
  else if (/linux/i.test(ua)) os = 'linux';
  else if (/android/i.test(ua)) os = 'android';
  else if (/ios|iphone|ipad/i.test(ua)) os = 'ios';

  return { device, browser, os };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { path, referrer, sessionId } = body;

    if (!path || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';
    const { device, browser, os } = parseUserAgent(userAgent);

    // Get geo data from headers (Vercel provides these)
    const country = request.headers.get('x-vercel-ip-country') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;

    // Create page view record
    await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        userId: session?.user?.id || null,
        sessionId,
        userAgent,
        country,
        city,
        device,
        browser,
        os,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
