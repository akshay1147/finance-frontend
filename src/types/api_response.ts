export interface PaginationMetadata {
  page?: number;
  page_size?: number;
  total?: number;
  has_next?: boolean;
  count?: number;
  [key: string]: any;
}

export interface ApiError {
  code?: string;
  message?: string;
  field?: string;
  trace_id?: string;
  request_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  remediation?: string;
  error_code?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
  metadata?: PaginationMetadata & Record<string, any>;
  errors?: ApiError[];
}

export function createSuccessResponse<T>(
  data: T,
  message = "OK",
  metadata?: Record<string, any>
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
