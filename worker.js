export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'AI Support Ticket Prioritizer is running!'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      try {
        const { message } = await request.json();

        if (!env.GROQ_API_KEY) {
          return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are a support ticket analyzer. Analyze the ticket and respond with ONLY the reply text.
Do NOT include category or priority in your response.
Just write a professional, actionable response to the customer.

For example, respond like:
"We understand how critical this issue is. We'll investigate immediately and provide an update within 30 minutes. Could you please share the exact error message you're seeing?"`
              },
              {
                role: 'user',
                content: `Analyze this support ticket and write a professional response:\n\n${message}`
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        const data = await groqResponse.json();
        
        // Get the AI response text
        const aiReply = data.choices[0].message.content;
        
        // Determine category and priority based on keywords
        let category = "GENERAL";
        let priority = "MEDIUM";
        
        const lowerMessage = message.toLowerCase();
        
        // Determine category
        if (lowerMessage.includes('login') || lowerMessage.includes('error') || lowerMessage.includes('bug') || 
            lowerMessage.includes('crash') || lowerMessage.includes('access') || lowerMessage.includes('technical')) {
          category = "SUPPORT";
        } else if (lowerMessage.includes('billing') || lowerMessage.includes('price') || lowerMessage.includes('payment') ||
                   lowerMessage.includes('subscription') || lowerMessage.includes('invoice')) {
          category = "SALES";
        }
        
        // Determine priority
        if (lowerMessage.includes('urgent') || lowerMessage.includes('critical') || lowerMessage.includes('emergency') ||
            lowerMessage.includes('locked out') || lowerMessage.includes('enterprise') || 
            lowerMessage.includes('entire team') || lowerMessage.includes('down')) {
          priority = "HIGH";
        } else if (lowerMessage.includes('how to') || lowerMessage.includes('question') || lowerMessage.includes('help with')) {
          priority = "MEDIUM";
        } else {
          priority = "LOW";
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: {
            category: category,
            priority: priority,
            reply: aiReply
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
      } catch (error) {
        console.error('Worker error:', error);
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
