import { NextResponse } from 'next/server';
import { startConversation } from './store';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (body?.action === 'start') {
    const n = String(body?.name || '').trim();
    if (!n) return NextResponse.json({ message: 'name required' }, { status: 400 });
    return NextResponse.json(startConversation(n));
  }
  return NextResponse.json({ message: 'Unsupported action' }, { status: 400 });
}