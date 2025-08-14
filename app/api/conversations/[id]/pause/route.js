import { NextResponse } from 'next/server';
import { pauseConversation } from '../../store';

export async function POST(_req, { params }) {
  return NextResponse.json(pauseConversation(params.id) || null);
}