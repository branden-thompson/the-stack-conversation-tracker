// app/api/conversations/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getConversation, patchConversation, deleteConversation } from '../store';

export async function GET(_req, { params }) {
  const c = getConversation(params.id);
  if (!c) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req, { params }) {
  const patch = await req.json().catch(() => ({}));
  const c = patchConversation(params.id, patch);
  if (!c) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(c);
}

export async function DELETE(_req, { params }) {
  deleteConversation(params.id);
  return NextResponse.json({ ok: true });
}