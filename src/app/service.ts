
import { AuthJWTResponseFilter, AuthResponseFilter } from "../Helper/AuthHelper";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  body?: Record<string, any>;
  authToken?: string | null;    // for bearer token flows
  withCredentials?: boolean;    // for cookie/session flows
}

export function customAuthApiCall(
  url: string,
  method: HttpMethod,
  optionsInput: ApiOptions = {}
): Promise<any> {
  const { body, authToken, withCredentials } = optionsInput;
  const domain = 'http://gurutth.duckdns.org:8082';
  const fullUrl = `${domain}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
  };
  console.log("Fetch Options:", fetchOptions);

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }
  return fetch(fullUrl, fetchOptions).then(async (response) => {
    return AuthResponseFilter(response);
  });
}


export async function customApiCall(
  url: string,
  method: HttpMethod,
  optionsInput: ApiOptions = {}
): Promise<any> {
  const { body } = optionsInput;
  const domain = 'http://gurutth.duckdns.org:8080';
  const fullUrl = `${domain}${url}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }
  if(typeof window == "undefined"){
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    (fetchOptions.headers as any).cookie = cookieStore.toString();
    console.log("inServer",url,(await cookieStore).toString())
    return fetch(fullUrl, fetchOptions).then(async (response) => {
    return AuthJWTResponseFilter(response);
  });
  }
  console.log(url,fetchOptions)
  return fetch(fullUrl, fetchOptions).then(async (response) => {
  return AuthJWTResponseFilter(response);;
  });
}
