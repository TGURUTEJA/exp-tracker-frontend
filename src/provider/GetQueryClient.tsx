import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes // 30 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // On the server, always create a new QueryClient
    return makeQueryClient();
  }
    if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
}