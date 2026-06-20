import { ApiResponse } from "@/types/api_response";
import { telemetryService } from "@/services/telemetry/telemetry_service";

export class ContractValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractValidationError";
  }
}

const BASE_URL = "/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    let payload: any;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      if (payload && typeof payload.success === "boolean") {
        telemetryService.trackApiFailure(endpoint, response.status, payload);
        return payload as ApiResponse<T>;
      }
      const errPayload = {
        success: false,
        message: payload?.error || payload?.message || `Request failed with status ${response.status}`,
        errors: payload?.errors || [
          {
            code: `HTTP_${response.status}`,
            message: `Request failed with status ${response.status}`,
          },
        ],
      };
      telemetryService.trackApiFailure(endpoint, response.status, errPayload);
      return errPayload;
    }

    // Strict contract enforcement
    if (!payload || typeof payload.success !== "boolean") {
      const error = new ContractValidationError(`API endpoint ${endpoint} returned a non-contract payload.`);
      telemetryService.trackApiFailure(endpoint, response.status, error.message);
      throw error;
    }

    return payload as ApiResponse<T>;
  } catch (error: any) {
    telemetryService.trackApiFailure(endpoint, 0, error);
    if (error instanceof ContractValidationError) {
      throw error;
    }
    return {
      success: false,
      message: error.message || "Network request failed",
      errors: [
        {
          code: "NETWORK_ERROR",
          message: error.message || "Check network connection and api server status",
        },
      ],
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
