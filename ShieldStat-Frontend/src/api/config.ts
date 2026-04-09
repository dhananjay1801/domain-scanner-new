function resolveBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'http://127.0.0.1:8000';

  // Allow relative base URLs (e.g. "/api") when proxying through Next.js.
  if (trimmed.startsWith('/')) {
    if (typeof window === 'undefined') return trimmed.replace(/\/+$/, '');
    return `${window.location.origin}${trimmed}`.replace(/\/+$/, '');
  }

  return trimmed.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000');

const API_PREFIX = '/api';

export interface CustomRequestInit extends RequestInit {
  timeout?: number;
  requiresAuth?: boolean;
}

let authRedirectInFlight = false;

function redirectToLogin() {
  if (typeof window === 'undefined' || authRedirectInFlight) return;

  authRedirectInFlight = true;
  localStorage.removeItem('token');
  localStorage.removeItem('auth_user');
  window.location.replace('/login');
}

function normalizeUrl(endpoint: string): string {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  
  const baseAlreadyHasApi = API_BASE_URL.endsWith('/api') || API_BASE_URL.endsWith('/api/');
  const prefix = baseAlreadyHasApi ? '' : API_PREFIX;

  let url = `${API_BASE_URL}${prefix}${cleanEndpoint}`;
  
  while (url.includes('/api/api/')) {
    url = url.replace('/api/api/', '/api/');
  }
  
  return url;
}

/**
 * A wrapper around the built-in fetch API to handle common tasks
 * like setting headers, handling JSON response, and error catching.
 */
export async function apiFetch<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
  const url = normalizeUrl(endpoint);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000);

  const requiresAuth = options.requiresAuth ?? true;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (requiresAuth && !token) {
    clearTimeout(timeoutId);
    const error = new Error('Not authenticated');
    (error as any).status = 401;
    redirectToLogin();
    throw error;
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (error) {
      // If response is not JSON
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401 && requiresAuth) {
        redirectToLogin();
      }
      const errorMessage = data?.detail || data?.message || response.statusText;
      const expectedStatuses = [202, 404, 410];
      if (!expectedStatuses.includes(response.status)) {
        console.error(`[apiFetch] ${response.status} ${response.statusText} — ${url}`);
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Backend server is not reachable. Make sure the API server is running on ' + API_BASE_URL);
    }
    throw error;
  }
}
