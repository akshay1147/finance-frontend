export interface ErrorState {
  isError: boolean;
  error_message: string;
  error_code: string;
  trace_id: string;
}

export const initialErrorState: ErrorState = {
  isError: false,
  error_message: "",
  error_code: "",
  trace_id: ""
};

export function createErrorState(
  isError = false,
  error_message = "",
  error_code = "",
  trace_id = ""
): ErrorState {
  return { isError, error_message, error_code, trace_id };
}
