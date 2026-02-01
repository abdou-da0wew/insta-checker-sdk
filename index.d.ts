import { Agent } from 'https';

export interface CheckerOptions {
    /**
     * How long to wait for a response
     * @default 5000
     */
    timeout?: number;
    /**
     * How many checks at once
     * @default 5
     */
    concurrency?: number;
    /**
     * Retry attempts on failure
     * @default 2
     */
    retries?: number;
    /**
     * How long to cache results (ms)
     * @default 300000
     */
    cacheTTL?: number;
    /**
     * Enable memory cache
     * @default true
     */
    enableCache?: boolean;
}

export interface CheckResult {
    available: boolean;
    cached: boolean;
}

export interface BatchProgressInfo {
    current: number;
    total: number;
    username: string;
    lastResult: boolean | null;
}

export interface BatchOptions {
    /**
     * Callback function called on every item completion
     */
    onProgress?: (info: BatchProgressInfo) => void;
}

declare class InstaChecker {
    /**
     * @param opts - User options
     */
    constructor(opts?: CheckerOptions);

    /**
     * Check one username
     * @param username - The username to check
     * @returns Promise containing availability and cached status
     */
    checkUsername(username: string): Promise<CheckResult>;

    /**
     * Check multiple usernames in parallel
     * @param usernames - Array of usernames
     * @param options - Optional progress callback
     * @returns Map of username to availability boolean (or null if errored)
     */
    checkBatch(usernames: string[], options?: BatchOptions): Promise<Record<string, boolean | null>>;

    /**
     * Clears in-memory cache
     */
    clearCache(): void;
}

export default InstaChecker;
