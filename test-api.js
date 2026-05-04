const http = require('http');

const testData = {
    message: "I cannot login to my account, it's urgent! Please help me access my account."
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

console.log('Testing API with message:', testData.message);

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:', data);
        
        try {
            const result = JSON.parse(data);
            if (result.success && result.data) {
                console.log('\n✅ API Test Successful!');
                console.log('Category:', result.data.category);
                console.log('Priority:', result.data.priority);
                console.log('AI Reply:', result.data.aiReply);
            } else {
                console.log('\n❌ API Test Failed:', result);
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
