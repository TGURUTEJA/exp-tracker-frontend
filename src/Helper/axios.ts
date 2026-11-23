import axios, { AxiosInstance } from "axios";

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

// Auth service instance
export const authApi = axios.create({
  baseURL: resolveAuthBaseUrl(),
  withCredentials: true,
});

// App service instance
export const appApi = axios.create({
  baseURL: resolveAppBaseUrl(),
  withCredentials: true,
});

// Shared 401 interceptor
const addUnauthorizedInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const payload = error?.response?.data;
      const requestUrl: string = error?.config?.url ?? "";

      // Handle login/register 401 differently
      if (status === 401 && typeof window !== "undefined") {
        const isAuthRequest =
          requestUrl.includes("/login") || requestUrl.includes("/register");

        if (isAuthRequest) {
          if (payload && typeof payload === "object" && payload.message === "Account is not verified") {
            window.location.href = "/verify-email";
            return Promise.resolve(payload);
          }
          return Promise.resolve(payload);
        }

        // All other 401s redirect to login
        window.location.href = "/login";
        return Promise.reject(payload);
      }

      // Handle 500 errors globally
      if (status === 500) {
        if (typeof payload === "string" && typeof window !== "undefined") {
          alert(`Server Error: ${payload}`);
        } else if (payload && typeof payload === "object" && "errorMessage" in payload) {
          return Promise.reject(payload);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptor to both instances
addUnauthorizedInterceptor(authApi);
addUnauthorizedInterceptor(appApi);