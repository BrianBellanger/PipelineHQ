export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export function success<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function fail(
  message: string,
  code = 'INTERNAL_ERROR',
  fields?: Record<string, string[]>
): ApiError {
  return {
    success: false,
    error: { code, message, ...(fields ? { fields } : {}) },
  };
}
