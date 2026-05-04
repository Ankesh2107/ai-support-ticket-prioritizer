const http = require('http');

const testMessages = [
    "I cannot login to my account, it's urgent! Please help me access my account.",
    "I'm interested in your pricing plans for a small business with 10 employees.",
    "How do I reset my password? I forgot it."
];

async function testConciseResponses() {
    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        console.log(`\n=== Test ${i + 1}: ${message.substring(0, 50)}... ===`);
        
        const postData = JSON.stringify({ message });
        
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
        
        await new Promise((resolve) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.success && result.data) {
                            console.log(`Category: ${result.data.category}`);
                            console.log(`Priority: ${result.data.priority}`);
                            console.log(`AI Reply: "${result.data.aiReply}"`);
                            
                            // Check if response is concise
                            const lines = result.data.aiReply.split('\n').filter(line => line.trim());
                            const hasSubject = result.data.aiReply.toLowerCase().includes('subject:');
                            const hasPlaceholders = /\[.*\]/.test(result.data.aiReply);
                            const hasSignature = result.data.aiReply.toLowerCase().includes('best regards') || 
                                              result.data.aiReply.toLowerCase().includes('sincerely') ||
                                              result.data.aiReply.toLowerCase().includes('customer support');
                            
                            console.log(`Lines: ${lines.length} | Subject: ${hasSubject} | Placeholders: ${hasPlaceholders} | Signature: ${hasSignature}`);
                            
                            if (lines.length <= 6 && !hasSubject && !hasPlaceholders && !hasSignature) {
                                console.log('✅ Perfect concise response!');
                            } else {
                                console.log('❌ Response needs improvement');
                            }
                        }
                    } catch (e) {
                        console.log('❌ Error parsing response:', e.message);
                    }
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Connection error:', error.message);
                resolve();
            });
            
            req.write(postData);
            req.end();
        });
    }
}

testConciseResponses();
