import * as https from 'https';

// --- Interfaces ---
// Defined at the top to ensure they are exported and visible before usage

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

// --- Class Implementation ---

/**
 * Simple class to check Instagram usernames.
 * Meant to be fairly robust, but also easy to tweak.
 */
class InstaChecker {
    private config: {
        timeout: number;
        concurrency: number;
        retries: number;
        cacheTTL: number;
        enableCache: boolean;
        apiUrl: string;
    };

    private agent: https.Agent;
    private cache: Map<string, { data: boolean; timestamp: number }>;

    /**
     * @param opts - User options
     * @param opts.timeout - How long to wait for a response
     * @param opts.concurrency - How many checks at once
     * @param opts.retries - Retry attempts on failure
     * @param opts.cacheTTL - How long to cache results (ms)
     * @param opts.enableCache - Enable memory cache
     */
    constructor(opts: CheckerOptions = {}) {
        // Default config, can override via opts
        this.config = {
            timeout: opts.timeout || 5000,
            concurrency: opts.concurrency || 5,
            retries: opts.retries ?? 2,
            cacheTTL: opts.cacheTTL || 300000,
            enableCache: opts.enableCache !== false,
            apiUrl: "https://wp2.hopperhq.com/wp-content/plugins/freetools-api/checker/username",
        };

        // Using keep-alive agent to avoid reconnecting every time
        this.agent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 50,
            maxFreeSockets: 10,
        });

        this.cache = new Map(); // Simple in-memory cache
    }

    /**
     * Check one username
     * @param username - The username to check
     * @returns Promise containing available status and cached flag
     */
    async checkUsername(username: string): Promise<CheckResult> {
        if (!username || typeof username !== "string") {
            throw new Error("Hey, give me a valid username string!");
        }
        const cleanName = username.trim();

        // Check cache first
        if (this.config.enableCache && this.cache.has(cleanName)) {
            const cached = this.cache.get(cleanName)!;
            if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                return { available: cached.data, cached: true };
            } else {
                this.cache.delete(cleanName); // cache expired
            }
        }

        let attempt = 0;
        let lastErr: Error | undefined;

        while (attempt <= this.config.retries) {
            try {
                const result = await this._makeRequest(cleanName);
                if (this.config.enableCache) {
                    this.cache.set(cleanName, { data: result, timestamp: Date.now() });
                }
                return { available: result, cached: false };
            } catch (err) {
                lastErr = err as Error;
                attempt++;
                // simple backoff, could make fancier if we wanted
                await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)));
            }
        }

        throw new Error(`Could not check "${cleanName}" after ${attempt} attempts. Last error: ${lastErr?.message}`);
    }

    /**
     * Internal method to actually send request
     * @private
     */
    private _makeRequest(username: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({ username, platform: "instagram" });

            const reqOptions: https.RequestOptions = {
                hostname: "wp2.hopperhq.com",
                path: "/wp-content/plugins/freetools-api/checker/username",
                method: "POST",
                agent: this.agent,
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; Functiolita/1.0; +https://axionforge.com/abdou-da0wew)",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            };

            const req = https.request(reqOptions, (res) => {
                let body = "";
                res.on("data", (chunk: string) => body += chunk);
                res.on("end", () => {
                    try {
                        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
                        const json = JSON.parse(body);
                        // Return false if data is missing or strictly unavailable
                        resolve(json.result?.available ?? false);
                    } catch (e) {
                        reject(new Error("Failed to parse JSON"));
                    }
                });
            });

            req.on("error", (err: Error) => reject(err));
            req.on("timeout", () => {
                req.destroy(); // make sure connection is killed
                reject(new Error("Request timed out"));
            });

            req.setTimeout(this.config.timeout);
            req.write(payload);
            req.end();
        });
    }

    /**
     * Check multiple usernames in parallel
     * @param usernames - Array of usernames to check
     * @param options - Optional callbacks
     */
    async checkBatch(usernames: string[], options: BatchOptions = {}): Promise<Record<string, boolean | null>> {
        if (!Array.isArray(usernames)) throw new Error("Usernames must be an array");

        const results: Record<string, boolean | null> = {};
        const queue = [...new Set(usernames)]; // Queue array
        let currentIndex = 0; // Shared index for safe concurrency
        let doneCount = 0;
        const total = queue.length;

        // Create worker functions
        const workers = Array.from({ length: this.config.concurrency }, async () => {
            while (currentIndex < queue.length) {
                // Grab index atomically (safe enough in single-threaded JS event loop)
                const index = currentIndex++;
                const name = queue[index];

                if (!name) break;

                try {
                    const res = await this.checkUsername(name);
                    results[name] = res.available;
                } catch (err) {
                    results[name] = null; // fallback in case of error
                    console.error(`Error checking ${name}: ${(err as Error).message}`);
                }

                doneCount++;
                if (options.onProgress) {
                    options.onProgress({ current: doneCount, total, username: name, lastResult: results[name] });
                }
            }
        });

        await Promise.all(workers);
        return results;
    }

    // Clears in-memory cache
    clearCache(): void {
        this.cache.clear();
    }
}

export default InstaChecker;
