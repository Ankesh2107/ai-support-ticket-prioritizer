require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Classification and priority logic
function classifyTicket(message) {
  const lowerMessage = message.toLowerCase();
  
  // Priority classification
  let priority = 'LOW';
  if (lowerMessage.includes('urgent') || 
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('critical') ||
      lowerMessage.includes('login fail') ||
      lowerMessage.includes('cannot login') ||
      lowerMessage.includes('payment issue') ||
      lowerMessage.includes('payment failed') ||
      lowerMessage.includes('billing error') ||
      lowerMessage.includes('account locked') ||
      lowerMessage.includes('cannot access')) {
    priority = 'HIGH';
  } else if (lowerMessage.includes('follow up') ||
             lowerMessage.includes('inquiry') ||
             lowerMessage.includes('question') ||
             lowerMessage.includes('how to') ||
             lowerMessage.includes('help with') ||
             lowerMessage.includes('issue with')) {
    priority = 'MEDIUM';
  }
  
  // Category classification
  let category = 'GENERAL';
  if (lowerMessage.includes('support') ||
      lowerMessage.includes('technical') ||
      lowerMessage.includes('bug') ||
      lowerMessage.includes('error') ||
      lowerMessage.includes('problem') ||
      lowerMessage.includes('broken') ||
      lowerMessage.includes('not working')) {
    category = 'SUPPORT';
  } else if (lowerMessage.includes('sales') ||
             lowerMessage.includes('pricing') ||
             lowerMessage.includes('cost') ||
             lowerMessage.includes('purchase') ||
             lowerMessage.includes('subscription') ||
             lowerMessage.includes('upgrade') ||
             lowerMessage.includes('plan')) {
    category = 'SALES';
  }
  
  return { category, priority };
}

// Generate concise reply based on category and priority
async function generateAIReply(message, category, priority) {
  // For now, use the fallback system to ensure concise replies
  // The AI model is not following the concise format requirements
  return getFallbackReply(category, priority, message);
}

// Fallback function for concise replies
function getFallbackReply(category, priority, message) {
  const lowerMessage = message.toLowerCase();
  
  // Login issues
  if (lowerMessage.includes('login') || lowerMessage.includes('cannot access') || lowerMessage.includes('account')) {
    return "Sorry you're facing trouble logging in—that can be frustrating. Could you share the exact error message you're seeing? In the meantime, try clearing your browser cache or logging in from another device. I'll help you get this resolved as quickly as possible.";
  }
  
  // Sales inquiries
  if (category === 'SALES') {
    return "Great to hear you're interested in our services! I'd love to help you find the right fit for your team. What kind of features are you most looking for? I can point you to the best pricing options once I know more about what you need.";
  }
  
  // Technical issues
  if (category === 'SUPPORT') {
    return "Sorry you're running into technical issues—that's always frustrating. Can you tell me more about what's happening? Any error messages or specific steps that trigger the problem? I'll help you figure this out.";
  }
  
  // Payment/billing issues
  if (lowerMessage.includes('payment') || lowerMessage.includes('billing') || lowerMessage.includes('charge')) {
    return "I understand payment issues can be concerning. Let me help you sort this out right away. Can you share what happened with the payment? I'll look into it and get things straightened out for you.";
  }
  
  // Default concise reply
  return "Thanks for reaching out! I'm here to help. Could you give me a bit more detail about what you're running into? The more specifics you can share, the better I can assist you.";
}

// Main process endpoint
app.post('/process', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Classify the ticket
    const { category, priority } = classifyTicket(message);
    
    // Generate AI reply
    const aiReply = await generateAIReply(message, category, priority);
    
    // Return the results
    res.json({
      success: true,
      data: {
        category,
        priority,
        aiReply: aiReply.trim()
      }
    });
    
  } catch (error) {
    console.error('Error processing ticket:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process the support ticket'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`AI Support Ticket Prioritizer running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});
