/**
 * Escapes SQL LIKE wildcards ('%', '_', '\') in search inputs.
 * Prevents ReDoS and unintentional Full Table Scan DoS attacks on MySQL text fields.
 */
export function escapeLikePattern(input: string): string {
  if (!input) return "";
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}
