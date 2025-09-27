export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}
