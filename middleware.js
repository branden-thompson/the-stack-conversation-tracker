import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Block direct access to dev-scripts directory in production
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/dev-scripts')) {
    // Return 404 to hide the existence of dev tools in production
    return new NextResponse(null, { status: 404 });
  }

  // Allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match dev-scripts paths
    '/dev-scripts/:path*',
    // Match API routes for dev-scripts (double protection)
    '/api/dev-scripts/:path*'
  ]
};