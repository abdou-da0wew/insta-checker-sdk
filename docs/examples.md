# Usage Examples

Here are some common patterns for using this SDK in different types of applications.

## Discord Bot (discord.js)

This example shows how to add a command to check a username.

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const InstaChecker = require('insta-checker-sdk');

// Initialize the checker
const checker = new InstaChecker({ timeout: 5000 });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async message => {
    if (message.content.startsWith('!check')) {
        // Get the username from the command
        const args = message.content.split(' ');
        const username = args[1];

        if (!username) {
            return message.reply('Please provide a username.');
        }

        // Reply immediately so the user knows we are working
        const msg = await message.channel.send(`Checking \`${username}\`...`);

        try {
            const result = await checker.checkUsername(username);
            
            let status = result.available ? 'Available' : 'Taken';
            if (result.cached) status += ' (Cached)';
            
            msg.edit(`Status: ${status}`);
        } catch (error) {
            msg.edit('Error checking username.');
        }
    }
});

client.login('YOUR_BOT_TOKEN');
```

## Express Web API

This example creates a simple HTTP endpoint to check usernames.

```javascript
const express = require('express');
const InstaChecker = require('insta-checker-sdk');

const app = express();
const checker = new InstaChecker({ concurrency: 20 });

// Middleware to parse JSON
app.use(express.json());

app.get('/api/check/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const result = await checker.checkUsername(username);
        res.json({
            username: username,
            available: result.available,
            cached: result.cached
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/check-batch', async (req, res) => {
    const { usernames } = req.body;

    if (!Array.isArray(usernames)) {
        return res.status(400).json({ error: 'Expected an array of usernames' });
    }

    try {
        const results = await checker.checkBatch(usernames);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Bulk Checking with Progress

If you need to check 10,000 usernames, you might want to log progress to the console.

```javascript
const InstaChecker = require('insta-checker-sdk');
const fs = require('fs');

const checker = new InstaChecker({ concurrency: 10 });

// Imagine you loaded this from a file
const hugeList = Array.from({ length: 1000 }, (_, i) => `user${i}`);

async function runBulk() {
    console.log(`Starting bulk check for ${hugeList.length} users...`);

    const startTime = Date.now();

    const results = await checker.checkBatch(hugeList, {
        onProgress: (info) => {
            // Update console log in place
            process.stdout.write(`\rProgress: ${info.current}/${info.total} (${Math.round(info.current/info.total*100)}%)`);
        }
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\nDone in ${duration} seconds.`);

    // Save to file
    fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
}

runBulk();
```
