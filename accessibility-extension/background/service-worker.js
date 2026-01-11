// Service Worker - Perplexity API
console.log('Service Worker: Starting...');

// ⚠️ REPLACE THIS WITH YOUR ACTUAL PERPLEXITY API KEY
// Get your key from: https://www.perplexity.ai/settings/api
const PERPLEXITY_API_KEY = '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'; // PUT YOUR REAL KEY HERE

console.log('Service Worker: Initialized with Perplexity API!');
console.log('Service Worker: API Key present?', PERPLEXITY_API_KEY ? 'YES' : 'NO');
console.log('Service Worker: API Key starts with pplx-?', PERPLEXITY_API_KEY.startsWith('pplx-') ? 'YES' : 'NO');

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service Worker: Received message:', message.type);

  if (message.type === 'GET_AI_RESPONSE') {
    console.log('Service Worker: Processing AI request...');
    console.log('Service Worker: Question:', message.question);
    console.log('Service Worker: Topic:', message.topic);
    
    // Call Perplexity API
    getPerplexityResponse(message.question, message.context, message.topic)
      .then(answer => {
        console.log('Service Worker: ✅ Got answer from Perplexity');
        sendResponse({ success: true, answer: answer });
      })
      .catch(error => {
        console.error('Service Worker: ❌ Error:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Sorry, I could not get an answer. Please try again.' 
        });
      });
    
    return true; // IMPORTANT: Keep message channel open for async response
  }

  return false;
});

// Get AI response from Perplexity API
async function getPerplexityResponse(question, context, topic) {
  console.log('Service Worker: Calling Perplexity API...');
  console.log('Service Worker: Using API key:', PERPLEXITY_API_KEY.substring(0, 10) + '...');
  
  // Better API key validation
  if (!PERPLEXITY_API_KEY) {
    throw new Error('API key is not defined');
  }
  
  if (!PERPLEXITY_API_KEY.startsWith('pplx-')) {
    throw new Error('Invalid API key format. Should start with "pplx-"');
  }
  
  if (PERPLEXITY_API_KEY.length < 20) {
    throw new Error('API key seems too short. Please check your key.');
  }

  // Perplexity API endpoint (OpenAI-compatible)
  const API_URL = 'https://api.perplexity.ai/chat/completions';
  
  // Create the prompt for the AI
  const systemPrompt = `You are a helpful educational assistant for students with disabilities in Indian classrooms. Answer questions clearly and simply in 2-3 sentences.`;
  
  const userPrompt = `Topic: ${topic}

Student's Question: ${question}

Context from page:
${context.substring(0, 1500)}

Answer in 2-3 simple sentences:`;

  console.log('Service Worker: Sending request to Perplexity...');

  try {
    // Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    console.log('Service Worker: Response status:', response.status);

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Service Worker: Perplexity API error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Perplexity API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    // Parse the response
    const data = await response.json();
    console.log('Service Worker: Perplexity API response received');
    
    // Extract the answer (OpenAI-compatible format)
    if (data.choices && 
        data.choices[0] && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      
      const answer = data.choices[0].message.content.trim();
      console.log('Service Worker: ✅ Successfully got answer from Perplexity');
      return answer;
    }
    
    console.error('Service Worker: Unexpected response format:', data);
    throw new Error('Invalid response format from Perplexity API');
    
  } catch (error) {
    console.error('Service Worker: Perplexity API error:', error);
    throw error;
  }
}

// Handle TL;DR Summary Generation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service Worker: Received message:', message.type);

  if (message.type === 'GET_AI_RESPONSE') {
    // Your existing AI response handler
    getPerplexityResponse(message.question, message.context, message.topic)
      .then(answer => {
        console.log('Service Worker: ✅ Got answer from Perplexity');
        sendResponse({ success: true, answer: answer });
      })
      .catch(error => {
        console.error('Service Worker: ❌ Error:', error);
        sendResponse({ 
          success: false, 
          error: 'Sorry, I could not get an answer. Please try again.' 
        });
      });
    
    return true;
  }

  // NEW: TL;DR Handler
  if (message.type === 'GENERATE_TLDR') {
    console.log('Service Worker: Generating TL;DR summary...');
    
    generateTLDR(message.text)
      .then(summary => {
        console.log('Service Worker: ✅ Got TL;DR summary');
        sendResponse({ success: true, summary: summary });
      })
      .catch(error => {
        console.error('Service Worker: ❌ TL;DR Error:', error);
        sendResponse({ 
          success: false, 
          error: 'Could not generate summary.' 
        });
      });
    
    return true;
  }

  return false;
});

// NEW: Generate TL;DR summary using Perplexity
async function generateTLDR(pageText) {
  console.log('Service Worker: Calling Perplexity for TL;DR...');
  
  if (!PERPLEXITY_API_KEY || !PERPLEXITY_API_KEY.startsWith('pplx-')) {
    throw new Error('Invalid Perplexity API key');
  }

  const API_URL = 'https://api.perplexity.ai/chat/completions';
  
  const systemPrompt = `You are a helpful assistant for students with ADHD. Summarize content in exactly 3 clear, simple bullet points.`;
  
  const userPrompt = `Summarize this content in exactly 3 bullet points for a student with ADHD. Keep each point short and clear (max 20 words each):

${pageText}

Format: 
• Point 1
• Point 2
• Point 3`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Service Worker: Perplexity TL;DR error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const summary = data.choices[0].message.content.trim();
      console.log('Service Worker: ✅ TL;DR generated');
      return summary;
    }
    
    throw new Error('Invalid response format from Perplexity API');
    
  } catch (error) {
    console.error('Service Worker: TL;DR API error:', error);
    throw error;
  }
}

// NEW: Image Description Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... existing handlers (GET_AI_RESPONSE, GENERATE_TLDR)

  // NEW: Image Description
  if (message.type === 'DESCRIBE_IMAGE') {
    console.log('Service Worker: Generating image description...');
    
    describeImage(message.imageUrl)
      .then(description => {
        console.log('Service Worker: ✅ Got image description');
        sendResponse({ success: true, description: description });
      })
      .catch(error => {
        console.error('Service Worker: ❌ Image Description Error:', error);
        sendResponse({ 
          success: false, 
          error: 'Could not describe image.' 
        });
      });
    
    return true;
  }

  return false;
});

// NEW: Describe image using Perplexity (text-based approximation)
async function describeImage(imageUrl) {
  console.log('Service Worker: Analyzing image URL:', imageUrl);
  
  if (!PERPLEXITY_API_KEY || !PERPLEXITY_API_KEY.startsWith('pplx-')) {
    throw new Error('Invalid Perplexity API key');
  }

  const API_URL = 'https://api.perplexity.ai/chat/completions';
  
  // Note: Perplexity's Sonar models don't support image input
  // This is a workaround using URL context
  const systemPrompt = `You are an AI assistant that describes images for visually impaired students. Provide clear, concise descriptions in 2-3 sentences.`;
  
  const userPrompt = `This image is from the URL: ${imageUrl}

Based on the URL context and common web image patterns, provide a helpful description of what this image likely contains. Focus on educational content, diagrams, charts, or photos. Keep it clear and concise (2-3 sentences).

If you cannot determine the content from the URL, provide a generic helpful description like "An image that may contain educational content. Consider asking someone to describe it in detail."`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Service Worker: Image Description error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const description = data.choices[0].message.content.trim();
      console.log('Service Worker: ✅ Image description generated');
      return description;
    }
    
    throw new Error('Invalid response format from Perplexity API');
    
  } catch (error) {
    console.error('Service Worker: Image Description API error:', error);
    // Fallback description
    return "An image on this webpage. For accurate description, please use a dedicated image recognition service or ask someone to describe it.";
  }
}


console.log('Service Worker: Ready and listening! 🚀');
