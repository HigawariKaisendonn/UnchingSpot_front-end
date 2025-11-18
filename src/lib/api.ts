const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

type FetchOptions = RequestInit & { query?: Record<string, string | number | boolean> };

export async function apiFetch(path: string, opts: FetchOptions = {}) {
  const { query, headers, ...rest } = opts;
  let url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => params.append(k, String(v)));
    url += `?${params.toString()}`;
  }

  const res = await fetch(url, {
    credentials: 'include', // use cookies for session-based auth
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  const contentType = res.headers.get('content-type') || '';
  let body: any = null;
  try {
    if (contentType.includes('application/json')) body = await res.json();
    else body = await res.text();
  } catch (e) {
    body = null;
  }

  if (!res.ok) {
    const err: any = new Error(`API Error: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export default apiFetch;
