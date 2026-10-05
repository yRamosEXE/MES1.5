import axios from 'axios';

export function logApiFallback(operation: string, error: unknown): void {
  if (axios.isAxiosError(error) && (error.response?.status === 503 || !error.response)) {
    console.info(`${operation}: API indisponível; usando dados mockados.`, {
      status: error.response?.status,
      code: error.code,
    });
    return;
  }

  console.warn(`${operation}: falha na API; usando dados mockados.`, error);
}

export async function withMockFallback<T>(
  request: () => Promise<unknown>,
  fallback: T,
  operation: string
): Promise<T> {
  try {
    return (await request()) as T;
  } catch (error: unknown) {
    logApiFallback(operation, error);
    return fallback;
  }
}