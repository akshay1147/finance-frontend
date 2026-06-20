export interface SuccessState<T> {
  isSuccess: boolean;
  data: T | null;
  message?: string;
}

export const initialSuccessState: SuccessState<any> = {
  isSuccess: false,
  data: null,
  message: ""
};

export function createSuccessState<T>(
  isSuccess = false,
  data: T | null = null,
  message = ""
): SuccessState<T> {
  return { isSuccess, data, message };
}
