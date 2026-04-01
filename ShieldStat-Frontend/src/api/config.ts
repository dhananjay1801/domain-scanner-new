export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface CustomRequestInit extends RequestInit {
  timeout?: number;
}

/**
 * A wrapper around the built-in fetch API to handle common tasks
 * like setting headers, handling JSON response, and error catching.
 */
export async function apiFetch<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
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
      const errorMessage = data?.detail || data?.message || response.statusText;
      throw new Error(errorMessage);
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
