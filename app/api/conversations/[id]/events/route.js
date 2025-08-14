export const dynamic = 'force-dynamic';

let store = global.__CONVO_STORE__;

function json(data, init = 200) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(_, { params }) {
  const events = store?.events?.[params.id];
  if (!events) return json({ error: 'Not found' }, 404);
  return json(events);
}

export async function POST(req, { params }) {
  const events = store?.events?.[params.id];
  if (!events) return json({ error: 'Not found' }, 404);
  const body = await req.json().catch(() => ({}));
  const evt = {
    id: crypto.randomUUID(),
    conversationId: params.id,
    type: body.type,          // 'card.created' | 'card.moved' | 'card.updated' | 'card.deleted'
    payload: body.payload ?? {},
    at: Date.now(),
  };
  events.push(evt);
  return json(evt, 201);
}

export async function DELETE(_, { params }) {
  const events = store?.events?.[params.id];
  if (!events) return json({ error: 'Not found' }, 404);
  store.events[params.id] = [];
  return json({ ok: true });
}