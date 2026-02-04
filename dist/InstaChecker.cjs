import * as https from 'https';
export class InstaChecker {
    constructor(opts = {}) {
        this.config = {
            timeout: opts.timeout || 5000,
            concurrency: opts.concurrency || 5,
            retries: opts.retries ?? 2,
            cacheTTL: opts.cacheTTL || 300000,
            enableCache: opts.enableCache !== false,
            apiUrl: "wp2.hopperhq.com",
        };
        this.agent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 50,
        });
        this.cache = new Map();
    }
    async checkUsername(username) {
        if (!username || typeof username !== "string") {
            throw new Error("Invalid username provided");
        }
        const cleanName = username.trim().toLowerCase();
        if (this.config.enableCache && this.cache.has(cleanName)) {
            const cached = this.cache.get(cleanName);
            if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                return { available: cached.data, cached: true };
            }
            this.cache.delete(cleanName);
        }
        let attempt = 0;
        let lastErr;
        while (attempt <= this.config.retries) {
            try {
                const result = await this._makeRequest(cleanName);
                if (this.config.enableCache) {
                    this.cache.set(cleanName, { data: result, timestamp: Date.now() });
                }
                return { available: result, cached: false };
            }
            catch (err) {
                lastErr = err;
                attempt++;
                if (attempt <= this.config.retries) {
                    await new Promise(r => setTimeout(r, 200 * attempt));
                }
            }
        }
        throw new Error(`Failed to check "${cleanName}" after ${attempt} attempts: ${lastErr?.message}`);
    }
    _makeRequest(username) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({ username, platform: "instagram" });
            const reqOptions = {
                hostname: this.config.apiUrl,
                path: "/wp-content/plugins/freetools-api/checker/username",
                method: "POST",
                agent: this.agent,
                headers: {
                    "User-Agent": "InstaCheckerSDK/1.0.6",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(payload),
                },
            };
            const req = https.request(reqOptions, (res) => {
                let body = "";
                res.on("data", (chunk) => body += chunk);
                res.on("end", () => {
                    try {
                        if (res.statusCode !== 200)
                            return reject(new Error(`HTTP ${res.statusCode}`));
                        const json = JSON.parse(body);
                        resolve(json.result?.available ?? false);
                    }
                    catch (e) {
                        reject(new Error("Invalid API response"));
                    }
                });
            });
            req.on("error", reject);
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timeout"));
            });
            req.setTimeout(this.config.timeout);
            req.write(payload);
            req.end();
        });
    }
    async checkBatch(usernames, options = {}) {
        const results = {};
        const queue = [...new Set(usernames)];
        let currentIndex = 0;
        let doneCount = 0;
        const workers = Array.from({ length: this.config.concurrency }, async () => {
            while (currentIndex < queue.length) {
                const name = queue[currentIndex++];
                if (!name)
                    break;
                try {
                    const res = await this.checkUsername(name);
                    results[name] = res.available;
                }
                catch (err) {
                    results[name] = null;
                }
                doneCount++;
                options.onProgress?.({
                    current: doneCount,
                    total: queue.length,
                    username: name,
                    lastResult: results[name]
                });
            }
        });
        await Promise.all(workers);
        return results;
    }
    clearCache() {
        this.cache.clear();
    }
}
// For ES modules
export default InstaChecker;
// For CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstaChecker;
    module.exports.default = InstaChecker;
}
//# sourceMappingURL=InstaChecker.js.map