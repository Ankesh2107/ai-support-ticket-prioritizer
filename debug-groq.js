require('dotenv').config();
const Groq = require('groq-sdk');

console.log('Testing Groq API integration...');
console.log('API Key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroqAPI() {
  try {
    console.log('Making API call...');
    
    const completion = await groq.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: "Hello! Can you help me with my login issue? I cannot access my account." 
      }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ API call successful!');
    console.log('Response:', completion.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testGroqAPI();
