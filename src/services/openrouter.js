/**
 * OpenRouter API Service
 * Handles communication with OpenRouter API for LLM-powered Q&A
 */

/**
 * Query OpenRouter API with system prompt and user message
 * @param {string} systemPrompt - System prompt to guide LLM behavior
 * @param {string} userMessage - User's question
 * @returns {Promise<string>} - LLM's response text
 * @throws {Error} - On API or network failures
 */
export async function queryOpenRouter(systemPrompt, userMessage) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const env = import.meta.env.VITE_ENV || 'dev';

  // Select model based on environment
  const model = env === 'prod'
    ? import.meta.env.VITE_OPENROUTER_MODEL_PROD
    : import.meta.env.VITE_OPENROUTER_MODEL_DEV;

  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'http://localhost:5556',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error.message.includes('OpenRouter API error')) {
      throw error;
    }
    throw new Error(`Network error communicating with OpenRouter: ${error.message}`);
  }
}
