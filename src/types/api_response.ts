export interface ApiError {
  trace_id: string;
  error_code: string;
  remediation: string;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  metadata?: Record<string, unknown>;
  errors?: ApiError[];
}

export function createSuccessResponse<T>(
  data: T,
  message = "OK",
  metadata?: Record<string, unknown>
): ApiResponse<T> {
  return { success: true, message, data, metadata };
}

export function createErrorResponse<T = null>(
  errorCode: string,
  message: string,
  remediation: string,
  traceId?: string
): ApiResponse<T> {
  const trace_id = traceId ?? generateTraceId();
  return {
    success: false,
    message,
    data: null,
    errors: [{ trace_id, error_code: errorCode, remediation, message }],
  };
}

export function generateTraceId(): string {
  return `trc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
