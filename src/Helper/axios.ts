import axios, { AxiosInstance } from "axios";

// Auth service instance
export const authApi = axios.create({
  baseURL: "http://localhost:8082", // auth service
  withCredentials: true,
});

// App service instance
export const appApi = axios.create({
  baseURL: "http://localhost:8080", // main app service
  withCredentials: true,
});

// Shared 401 interceptor
const addUnauthorizedInterceptor = (instance: AxiosInstance) => {
    console.log("Adding interceptor to instance:", instance.defaults.baseURL);
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const payload = error?.response?.data;

      // Handle login/register 401 differently
      if (status === 401 && typeof window !== "undefined") {
        // Check if this is login/register endpoint
        console.log("Handling 401 for URL:", error.config.url,payload);
        const isAuthRequest =
          error.config.url?.includes("/login") ||
          error.config.url?.includes("/register");

        if (isAuthRequest) {
          if (payload && payload.message === "Account is not verified") {
            // Redirect to verify-email page
            window.location.href = "/verify-email";
            return Promise.resolve(payload);
          } else {
            // Return the body so the caller can handle errors
            return Promise.resolve(payload);
          }
        }

        // All other 401s redirect to login
        window.location.href = "/login";
        return Promise.reject(payload);
      }

      // Handle 500 errors globally
      if (status === 500) {
        if (typeof payload === "string") {
          alert(`Server Error: ${payload}`);
        } else if (payload && (payload as any).errorMessage) {
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
