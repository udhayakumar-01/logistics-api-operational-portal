const BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, apiKey = 'demo-api-key-partner-admin'): Promise<{ data: T | null; status: number; headers: Headers; rawText: string; errorDetail?: any }> {
  const headers = new Headers(options.headers || {});
  if (apiKey) {
    headers.set('X-API-Key', apiKey);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const status = res.status;
    const resHeaders = res.headers;
    const rawText = await res.text();
    let data = null;
    let errorDetail = null;

    try {
      const parsed = JSON.parse(rawText);
      if (res.ok) {
        data = parsed as T;
      } else {
        errorDetail = parsed.detail || parsed;
      }
    } catch (e) {
      if (!res.ok) {
        errorDetail = { message: rawText };
      }
    }

    return { data, status, headers: resHeaders, rawText, errorDetail };
  } catch (err: any) {
    return {
      data: null,
      status: 500,
      headers: new Headers(),
      rawText: JSON.stringify({ message: err.message }),
      errorDetail: { error_code: 'NETWORK_ERROR', message: 'Failed to connect to backend operational server at http://localhost:8000', actionable_advice: 'Ensure FastAPI backend server is running.' }
    };
  }
}
