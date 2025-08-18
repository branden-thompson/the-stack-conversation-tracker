/**
 * Users and Sessions API Functions
 * 
 * Centralized API functions for user and session operations.
 * Used by both React Query hooks and legacy hooks.
 */

/**
 * Fetch all users from the API
 */
export async function fetchUsers() {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update a user
 */
export async function updateUser(id, updates) {
  const response = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a user
 */
export async function deleteUser(id) {
  const response = await fetch(`/api/users?id=${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch sessions from API
 */
export async function fetchSessions() {
  const response = await fetch('/api/sessions');
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

/**
 * Fetch recent events
 */
export async function fetchSessionEvents(limit = 100) {
  const response = await fetch(`/api/sessions/events?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  const data = await response.json();
  return data.events || [];
}

/**
 * Create simulated session
 */
export async function createSimulatedSession(count = 1, autoActivity = true) {
  const response = await fetch('/api/sessions/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, autoActivity }),
  });
  
  if (!response.ok) throw new Error('Failed to create simulated session');
  const data = await response.json();
  return data.sessions;
}

/**
 * Remove simulated sessions
 */
export async function removeSimulatedSessions(sessionId = null) {
  const url = sessionId 
    ? `/api/sessions/simulate?sessionId=${sessionId}`
    : '/api/sessions/simulate';
    
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to remove simulated sessions');
  return response.json();
}

/**
 * Get simulated sessions
 */
export async function fetchSimulatedSessions() {
  const response = await fetch('/api/sessions/simulate');
  if (!response.ok) throw new Error('Failed to fetch simulated sessions');
  const data = await response.json();
  return data.sessions;
}