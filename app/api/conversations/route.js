// app/api/conversations/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createConversation, listConversations, getActiveId } from './store';

export async function GET() {
  return NextResponse.json({
    items: listConversations(),
    activeId: getActiveId(),
  });
}

export async function POST(req) {
  const { name } = await req.json().catch(() => ({}));
  if (!name || !String(name).trim()) {
    return NextResponse.json({ message: 'name required' }, { status: 400 });
  }
  const conv = createConversation(String(name).trim());
  return NextResponse.json(conv);
}