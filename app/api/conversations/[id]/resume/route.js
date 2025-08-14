import { NextResponse } from 'next/server';
import { resumeConversation } from '../../store';

export async function POST(_req, { params }) {
  return NextResponse.json(resumeConversation(params.id) || null);
}