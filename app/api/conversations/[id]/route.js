export const dynamic = 'force-dynamic';

let store = global.__CONVO_STORE__;

function json(data, init = 200) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(_, { params }) {
  const convo = store.conversations.find(c => c.id === params.id);
  if (!convo) return json({ error: 'Not found' }, 404);
  return json(convo);
}

export async function PATCH(req, { params }) {
  const convo = store.conversations.find(c => c.id === params.id);
  if (!convo) return json({ error: 'Not found' }, 404);
  const body = await req.json().catch(() => ({}));
  Object.assign(convo, body, { updatedAt: Date.now() });
  return json(convo);
}

export async function DELETE(_, { params }) {
  const idx = store.conversations.findIndex(c => c.id === params.id);
  if (idx === -1) return json({ error: 'Not found' }, 404);
  store.conversations.splice(idx, 1);
  delete store.events[params.id];
  return json({ ok: true });
}