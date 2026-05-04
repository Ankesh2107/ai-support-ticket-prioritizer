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
                content: `You are a support ticket analyzer. Analyze the ticket and respond with ONLY THREE THINGS in this exact JSON format:

{
  "category": "SUPPORT or SALES or GENERAL",
  "priority": "HIGH or MEDIUM or LOW",
  "reply": "Write a professional, actionable response to the customer. Be specific and helpful. Do NOT include category or priority in the reply text. Keep it concise and professional."
}

Rules:
- HIGH priority: Critical issues (login failures, payment problems, system down, enterprise customers)
- MEDIUM priority: Important but not urgent (feature requests, how-to questions)
- LOW priority: General inquiries, feedback, non-urgent
- SUPPORT category: Technical issues, bugs, errors, access problems
- SALES category: Billing, pricing, subscriptions, upgrades
- GENERAL category: Questions, feedback, information

Return ONLY valid JSON. No other text.`
              },
              {
                role: 'user',
                content: `Analyze this support ticket and return category, priority, and reply:\n\n${message}`
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        const data = await groqResponse.json();
        
        // Try to parse JSON response
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(data.choices[0].message.content);
        } catch (e) {
          // Fallback if AI doesn't return valid JSON
          parsedResponse = {
            category: "GENERAL",
            priority: "MEDIUM",
            reply: data.choices[0].message.content
          };
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: parsedResponse
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
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
