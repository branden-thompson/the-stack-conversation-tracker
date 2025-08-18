import { NextResponse } from 'next/server';
import { stopConversation } from '../../store';

export async function POST(req, { params }) {
  const { id } = await params;
  // Extract userId from headers (set by session middleware)
  const userId = req.headers.get('x-user-id') || null;
  
  return NextResponse.json(stopConversation(id, userId) || true);
}