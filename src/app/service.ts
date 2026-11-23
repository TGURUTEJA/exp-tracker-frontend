import { AuthJWTResponseFilter, AuthResponseFilter } from "../Helper/AuthHelper";
import type { LoginResponse } from "../types/loginResponse";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  body?: unknown;
  authToken?: string | null;
  withCredentials?: boolean;
}

type DefaultApiResult = LoginResponse | string;

function resolveAuthBaseUrl(): string {
  const isServer = typeof window === "undefined";
  let authServiceUrl = "";
  let nextPublicAuthUrl = "";
  if(process.env.AUTH_SERVICE_INTERNAL_URL)
    authServiceUrl = process.env.AUTH_SERVICE_INTERNAL_URL;
    if(process.env.AUTH_SERVER_PORT)
      authServiceUrl += ":" + process.env.AUTH_SERVER_PORT;
  if(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL)
    nextPublicAuthUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ;
    if(process.env.NEXT_PUBLIC_AUTH_SERVER_PORT)
      nextPublicAuthUrl += ":" + process.env.NEXT_PUBLIC_AUTH_SERVER_PORT;
if (isServer) {
    return (
      authServiceUrl ||
      nextPublicAuthUrl ||
      "http://localhost:8082"
    );
  }
  return nextPublicAuthUrl || "http://localhost:8082";
}

function resolveAppBaseUrl(): string {
  const isServer = typeof window === "undefined";
  let appServiceUrl = "";
  let nextPublicAppUrl = "";
  if(process.env.APP_SERVICE_INTERNAL_URL)
    appServiceUrl = process.env.APP_SERVICE_INTERNAL_URL;
    if(process.env.APP_SERVER_PORT)
      appServiceUrl += ":" + process.env.APP_SERVER_PORT;
  if(process.env.NEXT_PUBLIC_APP_SERVICE_URL)
    nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_SERVICE_URL ;
    if(process.env.NEXT_PUBLIC_APP_SERVER_PORT)
      nextPublicAppUrl += ":" + process.env.NEXT_PUBLIC_APP_SERVER_PORT;
  if (isServer) {
    return (
      appServiceUrl ||
      nextPublicAppUrl ||
      "http://localhost:8080"
    );
  }
  return nextPublicAppUrl || "http://localhost:8080";
}

export async function customAuthApiCall<T = DefaultApiResult>(
  url: string,
  method: HttpMethod,
  optionsInput: ApiOptions = {}
): Promise<T> {
  const { body, authToken, withCredentials } = optionsInput;
  const domain = resolveAuthBaseUrl();
  const fullUrl = `${domain}${url}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: withCredentials ? "include" : "same-origin",
  };

  if (body !== undefined && body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(fullUrl, fetchOptions);
  const payload = await AuthResponseFilter(response);
  return payload as T;
}

export async function customApiCall<T = DefaultApiResult>(
  url: string,
  method: HttpMethod,
  optionsInput: ApiOptions = {}
): Promise<T> {
  const { body, authToken } = optionsInput;
  const domain = resolveAppBaseUrl();
  const fullUrl = `${domain}${url}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body !== undefined && body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();
    const cookieString = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (cookieString) {
      headers["cookie"] = cookieString;
    }

    const response = await fetch(fullUrl, fetchOptions);
    const payload = await AuthJWTResponseFilter(response);
    return payload as T;
  }

  const response = await fetch(fullUrl, fetchOptions);
  const payload = await AuthJWTResponseFilter(response);
  return payload as T;
}