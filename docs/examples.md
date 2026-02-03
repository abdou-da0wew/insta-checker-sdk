# Usage Examples

### 🤖 Discord.js Bot Command
Efficiently handle a user command to check availability without blocking the bot's heartbeat.

```javascript
const { InstaChecker } = require('insta-checker-sdk');
const checker = new InstaChecker({ concurrency: 2 });

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!check ')) {
        const username = message.content.split(' ')[1];
        
        const loading = await message.reply(`🔍 Scanning for \`${username}\`...`);
        
        try {
            const { available, cached } = await checker.checkUsername(username);
            const status = available ? '✅ Available' : '❌ Taken';
            const footer = cached ? ' (Result from cache)' : '';
            
            await loading.edit(`${status}${footer}`);
        } catch (err) {
            await loading.edit(`⚠️ Error: ${err.message}`);
        }
    }
});

```

### 🌐 Express.js API Endpoint

Create a microservice that checks batches of usernames.

```javascript
import express from 'express';
import { InstaChecker } from 'insta-checker-sdk';

const app = express();
const checker = new InstaChecker({ concurrency: 20 });

app.use(express.json());

app.post('/v1/batch-check', async (req, res) => {
    const { list } = req.body; // Expecting ["user1", "user2"]
    
    if (!Array.isArray(list)) return res.status(400).json({ error: "List must be an array" });

    try {
        const results = await checker.checkBatch(list);
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000);

```

### 🛠️ CLI Power-User Script

Check a list of 1,000 usernames with a progress bar and save results to JSON.

```javascript
import { InstaChecker } from 'insta-checker-sdk';
import fs from 'node:fs/promises';

const checker = new InstaChecker({ concurrency: 15 });
const usernames = ["alpha", "beta", "gamma", /* ... 1000 names */];

async function start() {
    console.log("🚀 Starting Bulk Scan...");
    
    const results = await checker.checkBatch(usernames, {
        onProgress: (info) => {
            const pct = Math.round((info.current / info.total) * 100);
            process.stdout.write(`\rProgress: ${pct}% [${info.current}/${info.total}] - Last: ${info.username}`);
        }
    });

    await fs.writeFile('output.json', JSON.stringify(results, null, 2));
    console.log("\n✅ Scan complete. Results saved to output.json");
}

start();

```
