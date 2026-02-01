"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
class InstaChecker {
    constructor(opts = {}) {
        this.config = {
            timeout: opts.timeout || 5000,
            concurrency: opts.concurrency || 5,
            retries: opts.retries ?? 2,
            cacheTTL: opts.cacheTTL || 300000,
            enableCache: opts.enableCache !== false,
            apiUrl: "https://wp2.hopperhq.com/wp-content/plugins/freetools-api/checker/username",
        };
        this.agent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 50,
            maxFreeSockets: 10,
        });
        this.cache = new Map();
    }
    async checkUsername(username) {
        if (!username || typeof username !== "string") {
            throw new Error("Hey, give me a valid username string!");
        }
        const cleanName = username.trim();
        if (this.config.enableCache && this.cache.has(cleanName)) {
            const cached = this.cache.get(cleanName);
            if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                return { available: cached.data, cached: true };
            }
            else {
                this.cache.delete(cleanName);
            }
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
                await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)));
            }
        }
        throw new Error(`Could not check "${cleanName}" after ${attempt} attempts. Last error: ${lastErr?.message}`);
    }
    _makeRequest(username) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({ username, platform: "instagram" });
            const reqOptions = {
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
                res.on("data", (chunk) => body += chunk);
                res.on("end", () => {
                    try {
                        if (res.statusCode !== 200)
                            return reject(new Error(`HTTP ${res.statusCode}`));
                        const json = JSON.parse(body);
                        resolve(json.result?.available ?? false);
                    }
                    catch (e) {
                        reject(new Error("Failed to parse JSON"));
                    }
                });
            });
            req.on("error", (err) => reject(err));
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timed out"));
            });
            req.setTimeout(this.config.timeout);
            req.write(payload);
            req.end();
        });
    }
    async checkBatch(usernames, options = {}) {
        if (!Array.isArray(usernames))
            throw new Error("Usernames must be an array");
        const results = {};
        const queue = [...new Set(usernames)];
        let currentIndex = 0;
        let doneCount = 0;
        const total = queue.length;
        const workers = Array.from({ length: this.config.concurrency }, async () => {
            while (currentIndex < queue.length) {
                const index = currentIndex++;
                const name = queue[index];
                if (!name)
                    break;
                try {
                    const res = await this.checkUsername(name);
                    results[name] = res.available;
                }
                catch (err) {
                    results[name] = null;
                    console.error(`Error checking ${name}: ${err.message}`);
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
    clearCache() {
        this.cache.clear();
    }
}
exports.default = InstaChecker;
