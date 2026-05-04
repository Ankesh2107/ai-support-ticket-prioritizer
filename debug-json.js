const http = require('http');

const testData = {
    message: "I cannot login to my account"
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/process',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing JSON response format...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
    
    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
        console.log(`Received chunk: ${chunk.length} bytes`);
    });
    
    res.on('end', () => {
        console.log(`\nRaw response data (${rawData.length} chars):`);
        console.log('---START---');
        console.log(rawData);
        console.log('---END---');
        
        // Try to parse as JSON
        try {
            const parsed = JSON.parse(rawData);
            console.log('\n✅ JSON parsed successfully:');
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('\n❌ JSON parsing failed:');
            console.log('Error:', e.message);
            console.log('Last chars:', rawData.slice(-50));
        }
    });
    
    res.on('error', (error) => {
        console.error('Response error:', error);
    });
});

req.on('error', (error) => {
    console.error('Request error:', error.message);
});

req.write(postData);
req.end();
