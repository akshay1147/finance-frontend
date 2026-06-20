export interface PaginationMetadata {
  page?: number;
  page_size?: number;
  total?: number;
  has_next?: boolean;
  count?: number;
  [key: string]: any;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  trace_id?: string;
  request_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  remediation?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  metadata?: PaginationMetadata;
  errors?: ApiError[];
}
