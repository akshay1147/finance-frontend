export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export const initialLoadingState: LoadingState = {
  isLoading: false,
  message: ""
};

export function createLoadingState(isLoading = false, message = ""): LoadingState {
  return { isLoading, message };
}
