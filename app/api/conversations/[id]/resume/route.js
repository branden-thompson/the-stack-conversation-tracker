import { NextResponse } from 'next/server';
import { resumeConversation } from '../../store';

export async function POST(req, { params }) {
  const { id } = await params;
  // Extract userId from headers (set by session middleware)
  const userId = req.headers.get('x-user-id') || null;
  
  return NextResponse.json(resumeConversation(id, userId) || null);
}