const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8088';

// トークンの保存と取得
const TOKEN_KEY = 'unchingspot_auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

type FetchOptions = RequestInit & { 
  query?: Record<string, string | number | boolean>;
  skipAuth?: boolean; // 認証をスキップする場合（ログイン/サインアップなど）
};

export async function apiFetch(path: string, opts: FetchOptions = {}) {
  const { query, headers, skipAuth = false, ...rest } = opts;
  let url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => params.append(k, String(v)));
    url += `?${params.toString()}`;
  }

  // 認証が必要なリクエストの場合、トークンをヘッダーに追加
  const authHeaders: Record<string, string> = {};
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // eslint-disable-next-line no-console
  console.log('[apiFetch] Request:', {
    url,
    method: rest.method,
    body: rest.body,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
  });

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
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

  // eslint-disable-next-line no-console
  console.log('[apiFetch] Response:', {
    status: res.status,
    statusText: res.statusText,
    body,
  });

  if (!res.ok) {
    const err: any = new Error(`API Error: ${res.status}`);
    err.status = res.status;
    err.body = body;
    // エラーレスポンスの形式を統一
    if (body?.error) {
      err.message = body.error.message || err.message;
      err.code = body.error.code;
    }
    throw err;
  }

  return body;
}

export default apiFetch;
