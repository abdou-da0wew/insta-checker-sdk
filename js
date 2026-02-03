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
