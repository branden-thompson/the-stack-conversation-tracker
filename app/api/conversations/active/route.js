import { NextResponse } from 'next/server';
import { getActive } from '../store';

export async function GET() {
  const a = getActive();
  if (!a) return NextResponse.json({ message: 'No active conversation' }, { status: 404 });
  return NextResponse.json(a);
}