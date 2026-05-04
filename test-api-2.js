const http = require('http');

const testData = {
    message: "I'm interested in your pricing plans for a small business with 10 employees."
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

console.log('Testing API with sales inquiry:', testData.message);

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success && result.data) {
                console.log('\n✅ Second API Test Successful!');
                console.log('Category:', result.data.category);
                console.log('Priority:', result.data.priority);
                console.log('AI Reply Length:', result.data.aiReply.length, 'characters');
                console.log('AI Reply Preview:', result.data.aiReply.substring(0, 100) + '...');
            }
        } catch (e) {
            console.log('\n❌ Failed to parse response:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
});

req.write(postData);
req.end();
