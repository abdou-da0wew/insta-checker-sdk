export interface CheckerOptions {
    timeout?: number;
    concurrency?: number;
    retries?: number;
    cacheTTL?: number;
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
    onProgress?: (info: BatchProgressInfo) => void;
}
export declare class InstaChecker {
    private config;
    private agent;
    private cache;
    constructor(opts?: CheckerOptions);
    checkUsername(username: string): Promise<CheckResult>;
    private _makeRequest;
    checkBatch(usernames: string[], options?: BatchOptions): Promise<Record<string, boolean | null>>;
    clearCache(): void;
}
export default InstaChecker;
