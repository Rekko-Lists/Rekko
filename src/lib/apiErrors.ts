export function extractApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const msg = (err as { response?: { data?: { error?: { message?: string } } } })
    ?.response?.data?.error?.message;

  // Never expose 5xx internals to the user
  if (!status || status >= 500) return fallback;

  return msg ?? fallback;
}
