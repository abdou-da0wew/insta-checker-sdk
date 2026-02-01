
# Getting Started

This guide covers the basics of setting up and running the Insta Checker SDK in your project.

## How it works

The library uses an external API to check availability. It sends a POST request and looks for the `available` status in the response.

To make this efficient for production, we do a few things:

1.  **Keep-Alive**: We open an HTTPS connection and keep it open to check many names without reconnecting.
2.  **Concurrency**: We don't fire off 1000 requests instantly. We queue them and process them in small batches (default is 5 at a time).
3.  **Memory Cache**: If you check "instagram" twice in 5 minutes, the second time comes from memory.

## Installation

Make sure you are using Node.js version 14 or higher.

```bash
npm install insta-checker-sdk
```
## Your first script

Create a file called `check.js` and paste this code:

```javascript
const InstaChecker = require('insta-checker-sdk');

// Create a new instance
const checker = new InstaChecker({
    timeout: 5000,
    retries: 3
});

async function main() {
    try {
        console.log('Checking username...');
        const result = await checker.checkUsername('microsoft');
        
        if (result.available) {
            console.log('Available!');
        } else {
            console.log('Taken.');
        }
    } catch (error) {
        console.error('Something went wrong:', error.message);
    }
}

main();
```

Run it:

```bash
node check.js
```

## TypeScript Support

If you use TypeScript, import the class and the types.

```typescript
import InstaChecker, { CheckerOptions, CheckResult } from 'insta-checker-sdk';

const options: CheckerOptions = {
    timeout: 4000
};

const checker = new InstaChecker(options);

const result: CheckResult = await checker.checkUsername('google');
```

The types are built into the package, so you don't need to install anything extra.

