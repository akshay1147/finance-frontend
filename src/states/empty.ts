export interface EmptyState {
  isEmpty: boolean;
  message?: string;
}

export const initialEmptyState: EmptyState = {
  isEmpty: false,
  message: ""
};

export function createEmptyState(isEmpty = false, message = ""): EmptyState {
  return { isEmpty, message };
}
