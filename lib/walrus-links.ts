/**
 * Link to a Walrus blob in the explorer named by NEXT_PUBLIC_WALRUS_BLOB_EXPLORER_URL
 * (a URL prefix the blob ID is appended to). Returns null when it is not configured,
 * so callers show the blob ID without a link instead of guessing an explorer.
 */
export function walrusBlobUrl(blobId: string): string | null {
  const prefix = (process.env.NEXT_PUBLIC_WALRUS_BLOB_EXPLORER_URL || "").trim();
  if (!prefix || !blobId) return null;
  return `${prefix}${encodeURIComponent(blobId)}`;
}
