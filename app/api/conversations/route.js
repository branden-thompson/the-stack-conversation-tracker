// app/api/conversations/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createConversation, listConversations, getActiveId } from './store';
import { withCache, invalidateCachePattern } from '@/lib/cache/api-cache';

export async function GET() {
  // Try cache first
  const cache = withCache('conversations');
  const cachedData = cache.get();
  
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  
  // Cache miss - fetch fresh data
  const data = {
    items: listConversations(),
    activeId: getActiveId(),
  };
  
  // Cache the response
  cache.set(data);
  
  return NextResponse.json(data);
}

export async function POST(req) {
  const { name } = await req.json().catch(() => ({}));
  if (!name || !String(name).trim()) {
    return NextResponse.json({ message: 'name required' }, { status: 400 });
  }
  
  const conv = createConversation(String(name).trim());
  
  // Invalidate conversations cache since we created a new one
  invalidateCachePattern('api:conversations');
  invalidateCachePattern('api:conversation:');
  
  return NextResponse.json(conv);
}