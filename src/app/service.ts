
import { AuthJWTResponseFilter, AuthResponseFilter } from "../Helper/AuthHelper";
import type { LoginResponse } from "../types/loginResponse";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  body?: unknown;
  authToken?: string | null;
  withCredentials?: boolean;
}

type DefaultApiResult = LoginResponse | string;

export async function customAuthApiCall<T = DefaultApiResult>(
  url: string,
  method: HttpMethod,
  optionsInput: ApiOptions = {}
): Promise<T> {
  const { body, withCredentials } = optionsInput;
  const domain = "http://localhost:8082";
  const fullUrl = `${domain}${url}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: withCredentials ? "include" : "same-origin",
  };
  console.log("Fetch Options:", fetchOptions);

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

  const { body } = optionsInput;
  const domain = "http://localhost:8080";
  const fullUrl = `${domain}${url}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

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
      (fetchOptions.headers as Record<string, string>)["cookie"] = cookieString;
    }

    console.log("Server Request:", url, cookieString);

    const response = await fetch(fullUrl, fetchOptions);
    const payload = await AuthJWTResponseFilter(response);
    return payload as T;
  }

  console.log("Client Request:", url);

  const response = await fetch(fullUrl, fetchOptions);
  const payload = await AuthJWTResponseFilter(response);
  return payload as T;
}
