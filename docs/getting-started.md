# Getting Started

Welcome to the Insta Checker SDK. This guide will help you move from installation to running high-volume username checks efficiently.

## Core Philosophy

This library is built for **scale**. When checking usernames at scale, the primary bottlenecks are DNS resolution and TCP handshake overhead. 

1.  **Connection Pooling**: We use a custom `https.Agent` with `keepAlive: true`. This maintains a pool of open sockets to the API server, allowing subsequent requests to bypass the handshake phase.
2.  **Queue Management**: The `checkBatch` method uses a worker-pool pattern to process usernames. You define the `concurrency` (default: 5), and the SDK ensures no more than that many requests are in-flight simultaneously.

## Setup Requirements
* **Runtime**: Node.js v18.0.0 or higher, or Bun v1.0.0 or higher.
* **Environment**: Works in both Server-side (Node/Bun) and Desktop (Electron) environments.

## Your First implementation

Create a file named `scanner.ts` (or `.js`):

```typescript
import { InstaChecker } from 'insta-checker-sdk';

// 1. Initialize with custom performance settings
const checker = new InstaChecker({
    concurrency: 10,   // Process 10 at a time
    retries: 3,        // Retry 3 times on network failure
    timeout: 4000      // 4 second timeout per request
});

async function run() {
    try {
        // 2. Check a single name
        const result = await checker.checkUsername('example_user');
        console.log(`Availability: ${result.available}`);

        // 3. Clean up if necessary
        checker.clearCache();
    } catch (error) {
        console.error("SDK Error:", error.message);
    }
}

run();

```

## TypeScript Configuration

If you are using TypeScript, ensure your `tsconfig.json` has `moduleResolution` set to `node` or `bundler` to correctly resolve the dual-mode exports.

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}

```

