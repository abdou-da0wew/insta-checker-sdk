// This file tests the CommonJS compatibility
const { InstaChecker } = require('./dist/index.cjs');

const checker = new InstaChecker({
  timeout: 5000,
  concurrency: 5
});

async function main() {
  const user = process.argv[2] || 'instagram';
  console.log(`Checking: ${user}...`);
  
  try {
    const result = await checker.checkUsername(user);
    console.log(`Result: ${result.available ? 'AVAILABLE' : 'TAKEN'}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

main();
