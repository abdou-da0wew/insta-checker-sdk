# Insta Checker SDK

A Node.js and TypeScript library to check if an Instagram username is available. It handles connection pooling, caching, and retries so you don't have to write that boilerplate yourself.

This is useful for Discord bots, web apps, or scripts that need to check a lot of names quickly.

## Installation

Install the package via npm:

```bash
npm install insta-checker-sdk
```

## Quick Start

Here is the simplest way to check one username.

```javascript
const InstaChecker = require('insta-checker-sdk');

const checker = new InstaChecker();

async function run() {
    const result = await checker.checkUsername('ninja');
    
    if (result.available) {
        console.log('The username is free.');
    } else {
        console.log('The username is taken.');
    }
}

run();
```

## Features

*   **Connection Pooling**: Reuses HTTP connections to check names faster.
*   **Caching**: Saves results in memory for a set time to avoid checking the same name twice.
*   **Retries**: Automatically tries again if a request times out or fails.
*   **Batch Checking**: Checks multiple names in parallel with a configurable limit.
*   **TypeScript Support**: Included types for full IDE autocomplete.

## Basic Usage

### Checking a single username

The `checkUsername` method returns an object with two properties: `available` (boolean) and `cached` (boolean).

```javascript
const InstaChecker = require('insta-checker-sdk');
const checker = new InstaChecker({ timeout: 3000 });

const result = await checker.checkUsername('apple');

console.log(result);
// Output: { available: false, cached: false }
```

### Checking multiple usernames

Use `checkBatch` to process a list of names. This runs checks in parallel based on your concurrency setting.

```javascript
const usernames = ['john', 'jane', 'doe', 'admin'];

const results = await checker.checkBatch(usernames);

console.log(results);
// Output: { john: false, jane: true, doe: true, admin: false }
```

You can add a callback to track progress while the batch is running.

```javascript
await checker.checkBatch(usernames, {
    onProgress: (info) => {
        console.log(`Checked ${info.current} of ${info.total}`);
    }
});
```

## Configuration

You can pass an options object to the constructor.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `timeout` | number | 5000 | Time to wait for a response in milliseconds. |
| `concurrency` | number | 5 | How many requests to send at the same time. |
| `retries` | number | 2 | How many times to retry a failed request. |
| `cacheTTL` | number | 300000 | How long to cache results in milliseconds (default 5 mins). |
| `enableCache` | boolean | true | Turn caching on or off. |

Example:

```javascript
const checker = new InstaChecker({
    concurrency: 10, // Check 10 names at once
    timeout: 2000,  // Fail fast after 2 seconds
    cacheTTL: 60000 // Keep cache for 1 minute
});
```

## Clearing Cache

If you want to force a refresh of all names, clear the cache manually.

```javascript
checker.clearCache();
```

## License

MIT
