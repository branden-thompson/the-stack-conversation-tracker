// app/api/conversations/active/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getActive } from '../store';

export async function GET() {
  const a = getActive();
  if (!a) return NextResponse.json({ message: 'No active' }, { status: 404 });
  return NextResponse.json(a);
}