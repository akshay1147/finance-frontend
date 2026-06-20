import { apiClient } from "./api_client";
import { ApiResponse } from "@/types/api_response";

class QueryClient {
  private cache = new Map<string, { data: any; expiry: number }>();
  private activeRequests = new Map<string, Promise<any>>();

  async fetch<T>(
    endpoint: string,
    options?: { ttl?: number; retryCount?: number; forceRefresh?: boolean }
  ): Promise<ApiResponse<T>> {
    const { ttl = 5000, retryCount = 2, forceRefresh = false } = options || {};

    if (!forceRefresh) {
      const cached = this.cache.get(endpoint);
      if (cached && cached.expiry > Date.now()) {
        return {
          success: true,
          message: "Data retrieved from cache",
          data: cached.data,
        };
      }
    }

    // Deduplication of concurrent identical requests
    if (this.activeRequests.has(endpoint)) {
      return this.activeRequests.get(endpoint)!;
    }

    const executeRequest = async (): Promise<ApiResponse<T>> => {
      let attempts = 0;
      while (attempts <= retryCount) {
        try {
          const res = await apiClient.get<T>(endpoint);
          if (res.success) {
            this.cache.set(endpoint, {
              data: res.data,
              expiry: Date.now() + ttl,
            });
            return res;
          }
          // If the request was successfully made but returned a logical failure (success=false), throw so retry handles it if appropriate or return it.
          // Wait, if it's a ContractValidationError, apiClient will throw.
          throw new Error(res.message || "Request failed");
        } catch (error: any) {
          attempts++;
          if (attempts > retryCount) {
            return {
              success: false,
              message: error.message || "Failed after retries",
              errors: [
                {
                  code: "QUERY_CLIENT_ERROR",
                  message: error.message || "Failed after retries",
                  trace_id: `QC-${Math.floor(1000 + Math.random() * 9000)}`
                },
              ],
            };
          }
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }
      return { success: false, message: "Exhausted retries" };
    };

    const promise = executeRequest().finally(() => {
      this.activeRequests.delete(endpoint);
    });

    this.activeRequests.set(endpoint, promise);
    return promise;
  }

  invalidate(endpoint: string) {
    this.cache.delete(endpoint);
  }
}

export const queryClient = new QueryClient();
