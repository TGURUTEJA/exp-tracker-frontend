type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  body?: Record<string, any>;
  authToken?: string | null;    // for bearer token flows
  withCredentials?: boolean;    // for cookie/session flows
}