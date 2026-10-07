import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { ApiError } from "./api";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 10 seconds (aligned with emergency cadence)
        staleTime: 10 * 1000,
        // Inactive cache garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,
        // Auto refetch when officer returns to browser tab
        refetchOnWindowFocus: true,
        // Exponential retry up to 2 times, but skip 4xx errors
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            // Never retry 401, 403, 404, or 409
            if ([401, 403, 404, 409].includes(error.statusCode)) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      dehydrate: {
        // Include pending queries in SSR dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client for each request
    return makeQueryClient();
  } else {
    // Browser: reuse the same client across renders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
