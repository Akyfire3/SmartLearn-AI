const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function generateSummary(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize. Please upload a PDF first.');
  }

  const prompt = `You are an expert academic assistant.

Analyze the uploaded study material and generate:

1. Chapter Overview
2. Key Concepts
3. Important Definitions
4. Important Exam Topics
5. Quick Revision Points

Return clean structured markdown.

Study Material:
${text}
`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from API');
    }
  } catch (error) {
    throw error;
  }
}

export async function testGemini() {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Say hello"
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from API');
    }
  } catch (error) {
    throw error;
  }
}
