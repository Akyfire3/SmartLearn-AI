const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function testAI() {
  console.log('🔹 testAI() called');
  console.log('🔹 API_KEY exists:', !!API_KEY);
  
  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: 'Say hello'
      }
    ]
  };
  
  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      const responseText = data.choices[0].message.content;
      console.log('✅ Extracted response text:', responseText);
      return responseText;
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ testAI failed:', error);
    throw error;
  }
}

export async function generateSummary(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize. Please upload a PDF first.');
  }

  console.log('🔹 generateSummary() called');
  console.log('🔹 API_KEY exists:', !!API_KEY);

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
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      const responseText = data.choices[0].message.content;
      console.log('✅ Extracted response text:', responseText);
      return responseText;
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateSummary failed:', error);
    throw error;
  }
}

export async function generateRevisionNotes(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize. Please upload a PDF first.');
  }

  console.log('🔹 generateRevisionNotes() called');
  console.log('🔹 API_KEY exists:', !!API_KEY);

  const prompt = `Create exam-focused revision notes.

Generate:

# Key Concepts

# Important Definitions

# Formulae (if applicable)

# Important Exam Questions

# Last Minute Revision Sheet

Return clean markdown.

Study Material:
${text}
`;

  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      const responseText = data.choices[0].message.content;
      console.log('✅ Extracted response text:', responseText);
      return responseText;
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateRevisionNotes failed:', error);
    throw error;
  }
}

export async function generateTopics(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to analyze. Please upload a PDF first.');
  }

  console.log('🔹 generateTopics() called');
  console.log('🔹 Extracted text length:', text.length);
  console.log('🔹 API_KEY exists:', !!API_KEY);

  const prompt = `Analyze the uploaded notes and extract the major study topics.

Return ONLY valid JSON:

{
  "topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ]
}

Study Material:
${text}
`;

  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      let responseText = data.choices[0].message.content;
      console.log('✅ Raw AI response:', responseText);
      
      // Safe JSON parsing - try multiple ways to extract JSON
      let jsonStr = responseText;
      
      // Try to find JSON between curly braces
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      // Remove any markdown code block markers
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      jsonStr = jsonStr.trim();
      
      console.log('🔹 Cleaned JSON string:', jsonStr);
      
      try {
        const topicsData = JSON.parse(jsonStr);
        console.log('✅ Parsed topics:', topicsData.topics);
        // Ensure we return an array
        if (Array.isArray(topicsData.topics) && topicsData.topics.length > 0) {
          return topicsData.topics;
        } else {
          throw new Error('Invalid topics format');
        }
      } catch (parseError) {
        console.error('🔴 JSON parse error:', parseError);
        console.error('🔴 Failed to parse, using fallback');
        // Fallback - return empty array (we'll handle in UI)
        return [];
      }
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateTopics failed:', error);
    throw error;
  }
}

export async function generateExamQuestions(text, questionType = 'Mixed', count = 10, topic = 'All Topics') {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to analyze. Please upload a PDF first.');
  }

  console.log('🔹 generateExamQuestions() called');
  console.log('🔹 Question Type:', questionType);
  console.log('🔹 Count:', count);
  console.log('🔹 Topic:', topic);

  const prompt = `You are an experienced university professor and exam paper setter.

Generate exactly ${count} ${questionType} questions.

Topic Focus:
${topic}

Requirements:

* Questions must be based ONLY on the uploaded notes.
* Questions should be suitable for university examinations.
* Avoid duplicates.
* Focus on important concepts.
* Include a model answer for each question.
* Include key points expected in the answer.

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "",
      "answer": "",
      "keyPoints": [
        "",
        "",
        ""
      ]
    }
  ]
}

Study Material:

${text}
`;

  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      let responseText = data.choices[0].message.content;
      console.log('✅ Raw AI response:', responseText);
      
      // Safe JSON parsing
      let jsonStr = responseText;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      jsonStr = jsonStr.trim();
      console.log('🔹 Cleaned JSON string:', jsonStr);
      
      try {
        const examData = JSON.parse(jsonStr);
        console.log('✅ Parsed exam questions:', examData.questions);
        if (Array.isArray(examData.questions) && examData.questions.length > 0) {
          return examData.questions;
        } else {
          throw new Error('Invalid questions format');
        }
      } catch (parseError) {
        console.error('🔴 JSON parse error:', parseError);
        throw new Error('Failed to parse exam questions from AI response');
      }
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateExamQuestions failed:', error);
    throw error;
  }
}

export async function generateQuiz(text, questionCount = 10, difficulty = 'Mixed', topic = 'All Topics') {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize. Please upload a PDF first.');
  }

  console.log('🔹 generateQuiz() called');
  console.log('🔹 API_KEY exists:', !!API_KEY);

  const prompt = `You are an expert university exam paper setter.

Analyze the study material and generate exactly ${questionCount} MCQs.

Difficulty:
${difficulty}

Topic Focus:
${topic}

Rules:

* Questions must come ONLY from the uploaded notes.
* Avoid duplicate questions.
* Questions should test understanding, not simple memorization.
* Only one correct answer.
* Make distractor options realistic.
* Suitable for engineering university examinations.
* Include a short explanation.

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "",
      "options": [
        "",
        "",
        "",
        ""
      ],
      "correctAnswer": "",
      "explanation": ""
    }
  ]
}

Study Material:

${text}
`;

  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      let responseText = data.choices[0].message.content;
      console.log('✅ Extracted response text:', responseText);
      
      // Safe JSON parsing - try to extract JSON from response
      let jsonStr = responseText;
      
      // Remove any markdown code block markers
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      jsonStr = jsonStr.trim();
      
      try {
        const quizData = JSON.parse(jsonStr);
        return quizData.questions;
      } catch (parseError) {
        console.error('🔴 JSON parse error:', parseError);
        throw new Error('Failed to parse quiz from AI response');
      }
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateQuiz failed:', error);
    throw error;
  }
}



export async function generateVivaQuestions(text, count = 10, difficulty = 'Mixed', topic = 'All Topics') {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize. Please upload a PDF first.');
  }

  console.log('🔹 generateVivaQuestions() called');
  console.log('🔹 Count:', count);
  console.log('🔹 Difficulty:', difficulty);
  console.log('🔹 Topic:', topic);

  const prompt = `You are an experienced university professor conducting an oral viva examination.

Generate exactly ${count} viva questions based on the uploaded study material.

Difficulty Level: ${difficulty}
Topic Focus: ${topic}

For each question, return ONLY valid JSON with the following structure:
{
  "questions": [
    {
      "question": "",
      "answer": "",
      "difficulty": "",
      "followUpQuestion": "",
      "keyPoints": []
    }
  ]
}

Rules for Question Generation:
1. Questions must be direct and professional - DO NOT use phrases like "Could you please...", "Kindly explain...", "Certainly...", "Thank you...".
2. Focus on conceptual understanding, not memorization.
3. Keep answers concise and exam-oriented (max 2-3 sentences).
4. Include a follow-up question whenever possible.
5. Generate a balanced mix of these question categories:
   - Definition Questions (e.g., "What is X?")
   - Conceptual Understanding Questions (e.g., "Explain Y.")
   - Difference/Comparison Questions (e.g., "Compare A and B.")
   - Real-world Application Questions (e.g., "Give an example of Z.")
   - Why/Reasoning Questions (e.g., "Why is C important?")
6. Difficulty should match the user's selection (Easy/Medium/Hard/Mixed).
7. Questions must be based ONLY on the uploaded study material.

Study Material:
${text}
`;

  const requestBody = {
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  console.log('🔹 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartLearn AI'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔹 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = await response.json();
        console.error('🔴 Error response JSON:', errorJson);
        errorDetails += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      } catch {
        const errorText = await response.text();
        console.error('🔴 Error response text:', errorText);
        errorDetails += ` - ${errorText}`;
      }
      throw new Error(errorDetails);
    }

    const data = await response.json();
    console.log('🔹 Full response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      let responseText = data.choices[0].message.content;
      console.log('✅ Raw AI response:', responseText);
      
      // Safe JSON parsing
      let jsonStr = responseText;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      jsonStr = jsonStr.trim();
      console.log('🔹 Cleaned JSON string:', jsonStr);
      
      try {
        const vivaData = JSON.parse(jsonStr);
        console.log('✅ Parsed viva questions:', vivaData.questions);
        if (Array.isArray(vivaData.questions) && vivaData.questions.length > 0) {
          return vivaData.questions;
        } else {
          throw new Error('Invalid questions format');
        }
      } catch (parseError) {
        console.error('🔴 JSON parse error:', parseError);
        throw new Error('Failed to parse viva questions from AI response');
      }
    } else {
      throw new Error('No valid response from AI - missing choices or message content');
    }
  } catch (error) {
    console.error('❌ generateVivaQuestions failed:', error);
    throw error;
  }
}
