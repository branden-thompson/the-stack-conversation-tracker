import { NextResponse } from 'next/server';
import { stopConversation } from '../../store';

export async function POST(_req, { params }) {
  return NextResponse.json(stopConversation(params.id) || true);
}