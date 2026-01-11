const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export interface ContentTopic {
    title: string;
    subtopics: string[];
}

export interface ContentDivisionResponse {
    topics: ContentTopic[];
}

export async function generateContentDivision(text: string): Promise<ContentDivisionResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing');
    }

    const prompt = `
    Analyze the following text from a study material and divide it into main topics and subtopics.
    Return the result as a STRICT JSON object with the following structure:
    {
      "topics": [
        {
          "title": "Main Topic Title",
          "subtopics": ["Subtopic 1", "Subtopic 2"]
        }
      ]
    }
    
    Do not include markdown formatting (like \`\`\`json) in the response, just the raw JSON string.
    
    Text to analyze:
    ${text.substring(0, 30000)} // Limit text length to avoid token limits
  `;

    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate content');
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No content generated');
        }

        // Clean up potential markdown formatting if the model ignores the instruction
        const cleanJson = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson) as ContentDivisionResponse;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}
