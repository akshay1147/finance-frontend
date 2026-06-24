import { apiClient } from "./api_client";
import { ApiResponse } from "@/types/api_response";

interface CacheEntry<T> {
  data: ApiResponse<T>;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<ApiResponse<T>>;
}

const DEFAULT_TTL_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

class QueryClient {
  private cache = new Map<string, CacheEntry<any>>();
  private pending = new Map<string, PendingRequest<any>>();

  private getCacheKey(key: string, params?: Record<string, unknown>): string {
    if (!params) return key;
    return `${key}:${JSON.stringify(params)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.cache.clear();
      return;
    }
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    });
  }

  async fetch<T>(
    keyOrEndpoint: string,
    fetcherOrOptions?: (() => Promise<ApiResponse<T>>) | { ttl?: number; retryCount?: number; forceRefresh?: boolean },
    options?: { ttlMs?: number; retries?: number; params?: Record<string, unknown> }
  ): Promise<ApiResponse<T>> {
    let fetcher: () => Promise<ApiResponse<T>>;
    let ttl = DEFAULT_TTL_MS;
    let maxRetries = DEFAULT_RETRIES;
    let params: Record<string, unknown> | undefined = undefined;
    let forceRefresh = false;

    if (typeof fetcherOrOptions === "function") {
      // develop signature
      fetcher = fetcherOrOptions;
      if (options) {
        ttl = options.ttlMs ?? DEFAULT_TTL_MS;
        maxRetries = options.retries ?? DEFAULT_RETRIES;
        params = options.params;
      }
    } else {
      // HEAD signature
      fetcher = () => apiClient.get<T>(keyOrEndpoint);
      if (fetcherOrOptions) {
        ttl = (fetcherOrOptions.ttl ?? 5) * 1000; // HEAD options.ttl is in seconds
        maxRetries = fetcherOrOptions.retryCount ?? DEFAULT_RETRIES;
        forceRefresh = fetcherOrOptions.forceRefresh ?? false;
      }
    }

    const cacheKey = this.getCacheKey(keyOrEndpoint, params);

    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
      if (cached && cached.expiresAt > Date.now()) {
        // If it's the HEAD signature, return the standard cache success envelope
        if (typeof fetcherOrOptions !== "function") {
          return {
            success: true,
            message: "Data retrieved from cache",
            data: cached.data.data,
          } as ApiResponse<T>;
        }
        return cached.data;
      }
    }

    const existing = this.pending.get(cacheKey) as PendingRequest<T> | undefined;
    if (existing) {
      return existing.promise;
    }

    const execute = async (): Promise<ApiResponse<T>> => {
      let lastError: ApiResponse<T> | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fetcher();
          if (result.success) {
            this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + ttl });
            return result;
          }
          lastError = result;
        } catch (error: any) {
          lastError = {
            success: false,
            message: error.message || "Fetch failed",
            data: null,
            errors: [
              {
                trace_id: `trc_retry_${attempt}`,
                error_code: "QUERY_RETRY",
                code: "QUERY_CLIENT_ERROR",
                remediation: "Automatic retry in progress.",
                message: error.message,
              },
            ],
          };
        }

        if (attempt < maxRetries) {
          const delay = typeof fetcherOrOptions === "function" 
            ? DEFAULT_RETRY_DELAY_MS * (attempt + 1)
            : 500 * (attempt + 1);
          await this.sleep(delay);
        }
      }

      return lastError ?? { success: false, message: "Unknown error", data: null };
    };

    const promise = execute().finally(() => {
      this.pending.delete(cacheKey);
    });

    this.pending.set(cacheKey, { promise });
    return promise;
  }
}

export const queryClient = new QueryClient();
