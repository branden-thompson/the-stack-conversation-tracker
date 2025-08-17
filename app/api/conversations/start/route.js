import { NextResponse } from 'next/server';
import { startConversation } from '../store';

export async function POST(req) {
  const { name = '' } = await req.json().catch(() => ({}));
  const n = String(name).trim();
  if (!n) return NextResponse.json({ message: 'name required' }, { status: 400 });
  
  // Extract userId from headers (set by session middleware)
  const userId = req.headers.get('x-user-id') || null;
  
  return NextResponse.json(startConversation(n, userId));
}