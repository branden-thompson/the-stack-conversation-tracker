import { NextResponse } from 'next/server';
import { stopConversation } from '../../store';

export async function POST(req, { params }) {
  // Extract userId from headers (set by session middleware)
  const userId = req.headers.get('x-user-id') || null;
  
  return NextResponse.json(stopConversation(params.id, userId) || true);
}