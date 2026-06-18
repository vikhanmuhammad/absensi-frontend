export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  status: number;
  error: { message: string };
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const body = (err as { error?: ApiErrorBody })?.error;
  return body?.error?.message || fallback;
}
