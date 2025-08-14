// DEV-ONLY in-memory conversations API
export const dynamic = 'force-dynamic';

let store = global.__CONVO_STORE__ || {
  conversations: [],
  events: {}, // { [conversationId]: Array<event> }
};
global.__CONVO_STORE__ = store;

function json(data, init = 200) {
  return new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET() {
  return json(store.conversations);
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const id = crypto.randomUUID();
  const now = Date.now();
  const convo = {
    id,
    name: body.name || 'Untitled conversation',
    status: 'paused', // 'active' | 'paused' | 'stopped'
    startedAt: null,
    pausedAt: null,
    stoppedAt: null,
    meta: body.meta || {},
    createdAt: now,
    updatedAt: now,
  };
  store.conversations.push(convo);
  store.events[id] = [];
  return json(convo, 201);
}