const http = require('http');

const testData = {
    message: "I need help with my login issue"
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

console.log('Testing /process endpoint...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Response: ${data}`);
        
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log('✅ /process endpoint working correctly!');
                console.log(`Category: ${result.data.category}`);
                console.log(`Priority: ${result.data.priority}`);
            } else {
                console.log('❌ API returned error:', result);
            }
        } catch (e) {
            console.log('❌ Failed to parse response:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
});

req.write(postData);
req.end();
