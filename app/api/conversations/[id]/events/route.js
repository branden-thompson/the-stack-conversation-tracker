// app/api/conversations/[id]/events/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listEvents, addEvent, clearEvents } from '../../store';

export async function GET(_req, { params }) {
  return NextResponse.json(listEvents(params.id));
}

export async function POST(req, { params }) {
  const { type, payload } = await req.json().catch(() => ({}));
  if (!type) return NextResponse.json({ message: 'type required' }, { status: 400 });
  const evt = addEvent(params.id, type, payload);
  if (!evt) return NextResponse.json({ message: 'conversation not found' }, { status: 404 });
  return NextResponse.json(evt);
}

export async function DELETE(_req, { params }) {
  clearEvents(params.id);
  return NextResponse.json({ ok: true });
}