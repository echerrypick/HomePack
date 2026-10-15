import { auth } from '../firebase';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to continue.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  headers.set('Content-Type', 'application/json');
  return fetch(url, { ...options, headers });
}

export async function billingRequest(url: string, body?: unknown, method?: 'POST' | 'PATCH' | 'DELETE') {
  const response = await authenticatedFetch(url, { method: method || (body === undefined ? 'GET' : 'POST'), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to complete this request.');
  return data;
}
