// Dev/local in-memory store. Swap to a DB later.
let _active = null;

function nowISO() { return new Date().toISOString(); }
function uuid() {
  return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getActive() { return _active; }

export function startConversation(name) {
  _active = { id: uuid(), name, status: 'active', startedAt: nowISO(), accumulatedMs: 0 };
  return _active;
}

export function pauseConversation(id) {
  if (!_active || _active.id !== id || _active.status !== 'active') return _active;
  const started = new Date(_active.startedAt).getTime();
  _active.accumulatedMs += Date.now() - started;
  _active.startedAt = null;
  _active.status = 'paused';
  return _active;
}

export function resumeConversation(id) {
  if (!_active || _active.id !== id || _active.status !== 'paused') return _active;
  _active.startedAt = nowISO();
  _active.status = 'active';
  return _active;
}

export function stopConversation(id) {
  if (!_active || _active.id !== id) return { ok: true };
  if (_active.status === 'active' && _active.startedAt) {
    const started = new Date(_active.startedAt).getTime();
    _active.accumulatedMs += Date.now() - started;
  }
  _active.status = 'stopped';
  const final = _active;
  _active = null;
  return final;
}