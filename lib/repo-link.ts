/** Public source repository, from NEXT_PUBLIC_REPO_URL. Null hides every repo link. */
export const REPO_URL: string | null = (process.env.NEXT_PUBLIC_REPO_URL || "").trim() || null;
