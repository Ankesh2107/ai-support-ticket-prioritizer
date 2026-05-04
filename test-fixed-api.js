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

console.log('Testing fixed API with real AI responses...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success && result.data) {
                console.log('\n✅ SUCCESS! Real AI response received:');
                console.log('Category:', result.data.category);
                console.log('Priority:', result.data.priority);
                console.log('AI Reply:', result.data.aiReply);
                
                // Check if it's the default fallback response
                if (result.data.aiReply.includes('Our support team will review your ticket')) {
                    console.log('\n❌ Still using fallback response - API not working');
                } else {
                    console.log('\n🎉 SUCCESS! Real AI-generated response!');
                }
            } else {
                console.log('❌ API returned error:', result);
            }
        } catch (e) {
            console.log('❌ Failed to parse response:', e.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
});

req.write(postData);
req.end();
