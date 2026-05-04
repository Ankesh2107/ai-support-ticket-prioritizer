const http = require('http');

// Test health endpoint
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Response: ${data}`);
        console.log('✅ Server is responding correctly!');
    });
});

req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
});

req.end();
