const InstaChecker = require('insta-checker-sdk');

// If you are testing the local build without publishing to npm yet,
// comment out the line above and use this instead:
// const InstaChecker = require('./dist/index.js');

// Setup the checker with some options to see if they work
const checker = new InstaChecker({
    timeout: 5000,
    concurrency: 5,
    retries: 2
});

// Helper to format time
const now = () => new Date().toLocaleTimeString();

async function main() {
    const args = process.argv.slice(2);

    console.log(`[${now()}] Starting test...`);

    if (args.length === 0) {
        console.log(`
Usage:
  node test-app.js <username>
  node test-app.js --batch user1,user2,user3

Examples:
  node test-app.js instagram
  node test-app.js --batch ninja,test123,impossible_username
        `);
        process.exit(1);
    }

    // Check if we are doing a batch test or single
    if (args[0] === '--batch') {
        await handleBatch(args[1]);
    } else {
        await handleSingle(args[0]);
    }
}

async function handleSingle(username) {
    console.log(`[${now()}] Checking single username: ${username}`);
    const start = Date.now();

    try {
        const result = await checker.checkUsername(username);
        const duration = Date.now() - start;
        
        const status = result.available ? 'AVAILABLE' : 'TAKEN';
        const source = result.cached ? '(Cached)' : '(Live API)';

        console.log(`[${now()}] Result: ${status} ${source}`);
        console.log(`[${now()}] Took ${duration}ms`);

    } catch (err) {
        console.error(`[${now()}] Error checking ${username}:`, err.message);
    }
}

async function handleBatch(csvList) {
    if (!csvList) {
        console.error('Please provide a comma-separated list after --batch');
        process.exit(1);
    }

    const usernames = csvList.split(',').map(u => u.trim());
    console.log(`[${now()}] Starting batch check for ${usernames.length} usernames...`);

    const start = Date.now();

    try {
        const results = await checker.checkBatch(usernames, {
            onProgress: (info) => {
                // Just show progress on one line
                process.stdout.write(`\r[${now()}] Progress: ${info.current}/${info.total}`);
            }
        });

        console.log('\n'); // New line after progress
        console.log('--- Batch Results ---');
        
        // Print a nice table of results
        Object.entries(results).forEach(([name, isAvailable]) => {
            const icon = isAvailable ? '✅' : '❌';
            console.log(`${icon} ${name}: ${isAvailable}`);
        });

        const duration = Date.now() - start;
        console.log(`--- Done in ${duration}ms ---`);

    } catch (err) {
        console.error('\nError during batch check:', err.message);
    }
}

// Run it
main();
