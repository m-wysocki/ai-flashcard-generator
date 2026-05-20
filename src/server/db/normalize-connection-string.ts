const SSLMODE_PATTERN = /([?&])sslmode=(prefer|require|verify-ca)(?=&|$)/gi;

export function normalizePgConnectionString(connectionString: string): string {
  if (!connectionString) {
    return connectionString;
  }

  return connectionString.replace(
    SSLMODE_PATTERN,
    (_match, separator) => `${separator}sslmode=verify-full`,
  );
}
