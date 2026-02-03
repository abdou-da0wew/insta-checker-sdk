# Insta Checker SDK 📸

[![NPM Version](https://img.shields.io/npm/v/insta-checker-sdk)](https://www.npmjs.com/package/insta-checker-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

A high-performance, production-ready Node.js and TypeScript library designed to check Instagram username availability. Unlike simple fetch scripts, this SDK implements professional-grade networking features including **HTTP/1.1 Connection Pooling**, **Parallel Concurrency Control**, and **Memory Caching**.

## 🚀 Key Features

* **📦 Dual-Mode Support**: Native ESM and CommonJS (CJS) support. Works perfectly with `import` or `require()`.
* **⚡ High Performance**: Uses a Persistent HTTPS Agent to reuse sockets, significantly reducing latency for batch checks.
* **🛡️ Robust Error Handling**: Built-in exponential backoff retries for network flakiness.
* **💾 Smart Caching**: Integrated TTL-based memory cache to prevent redundant API hits.
* **🚦 Concurrency Control**: Process thousands of usernames without hitting rate limits or crashing your event loop.
* **🔷 TypeScript Native**: Written in TS with full type definitions exported for a 10/10 developer experience.

## 📥 Installation

```bash
# Using npm
npm install insta-checker-sdk

# Using bun
bun add insta-checker-sdk

# Using yarn
yarn add insta-checker-sdk

```

## 🛠️ Quick Start

### Modern ESM (TypeScript/Bun/Node 18+)

```typescript
import InstaChecker from 'insta-checker-sdk';

const checker = new InstaChecker();
const { available, cached } = await checker.checkUsername('creative_name');

console.log(`Username is ${available ? 'FREE' : 'TAKEN'}`);

```

### Legacy CommonJS (Node.js)

```javascript
const { InstaChecker } = require('insta-checker-sdk');

const checker = new InstaChecker({ timeout: 3000 });

checker.checkUsername('google').then(result => {
    console.log(result.available); // false
});

```

## 📖 Documentation

* [Getting Started](/docs/getting-started.md)
* [API Reference](https://www.google.com/search?q=./docs/api-reference.md)
* [Usage Examples](https://www.google.com/search?q=./docs/examples.md)

## ⚖️ License

MIT © [Abdou-da0wew](https://www.google.com/search?q=https://github.com/abdou-da0wew)


