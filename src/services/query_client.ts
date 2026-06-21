import type { ApiResponse } from "@/types/api_response";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
}

const DEFAULT_TTL_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

class QueryClient {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, PendingRequest<unknown>>();

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
    key: string,
    fetcher: () => Promise<ApiResponse<T>>,
    options?: { ttlMs?: number; retries?: number; params?: Record<string, unknown> }
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(key, options?.params);
    const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
    const maxRetries = options?.retries ?? DEFAULT_RETRIES;

    const cached = this.cache.get(cacheKey) as CacheEntry<ApiResponse<T>> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const existing = this.pending.get(cacheKey) as PendingRequest<ApiResponse<T>> | undefined;
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
        } catch {
          lastError = {
            success: false,
            message: "Fetch failed",
            data: null,
            errors: [
              {
                trace_id: `trc_retry_${attempt}`,
                error_code: "QUERY_RETRY",
                remediation: "Automatic retry in progress.",
              },
            ],
          };
        }

        if (attempt < maxRetries) {
          await this.sleep(DEFAULT_RETRY_DELAY_MS * (attempt + 1));
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
