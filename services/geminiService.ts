
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// This is a mock implementation. In a real app, you would have an API key.
// As per instructions, we must assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using mock data.");
}
// We create a mock ai object if no API key is present to avoid crashing the app.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// --- MOCK RESPONSES ---
const MOCK_VIBE_SCORE = { vibe: "Adventurous Soul", score: 85 };
const MOCK_DATE_IDEA = { title: "Explore a Hidden Bookstore Cafe", description: "Let's get lost among shelves of old books and chat over artisanal coffee. A perfect, cozy afternoon escape.", location: "Downtown Arts District" };
const MOCK_CHAT_SUGGESTIONS = { suggestions: ["Ask about their favorite book genre.", "Mention a cool cafe you know.", "Challenge them to a literature quiz!"] };
const MOCK_BIO_FEEDBACK = { feedback: "Your bio is great! To make it even more engaging, maybe add a specific question to prompt conversation, like 'What's the best concert you've ever been to?'", vibe: "Upbeat & Welcoming" };

// Utility to simulate API delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCompatibility = async (userBio1: string, userBio2: string): Promise<{ vibe: string; score: number }> => {
  if (!ai) {
    await sleep(500);
    return MOCK_VIBE_SCORE;
  }
  try {
    const prompt = `Analyze the compatibility between two people based on their dating profiles.
    User 1 bio: "${userBio1}"
    User 2 bio: "${userBio2}"
    Provide a "vibe" for User 2 from User 1's perspective and a compatibility score between 0 and 100.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: 'application/json',
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  vibe: { type: Type.STRING },
                  score: { type: Type.NUMBER }
              }
          }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error getting compatibility:", error);
    return MOCK_VIBE_SCORE; // Fallback to mock data on error
  }
};

export const generateDateIdea = async (interests: string[]): Promise<{ title: string; description: string; location: string }> => {
    if (!ai) {
        await sleep(700);
        return MOCK_DATE_IDEA;
    }
    try {
        const prompt = `Generate a creative and fun date idea for someone whose interests include: ${interests.join(', ')}. Provide a title, a short, appealing description, and a suggested location type.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating date idea:", error);
        return MOCK_DATE_IDEA;
    }
};

export const getChatSuggestions = async (chatHistory: string): Promise<string[]> => {
    if (!ai) {
        await sleep(600);
        return MOCK_CHAT_SUGGESTIONS.suggestions;
    }
    try {
        const prompt = `You are an AI Wingman. Based on the following chat conversation, suggest three distinct, creative, and engaging replies for "Me". Keep them short and playful.
        Conversation:
        ${chatHistory}
        Me: ...
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);
        return parsed.suggestions;
    } catch (error) {
        console.error("Error getting chat suggestions:", error);
        return MOCK_CHAT_SUGGESTIONS.suggestions;
    }
};

export const getProfileFeedback = async (bio: string): Promise<{ feedback: string; vibe: string }> => {
    if (!ai) {
        await sleep(800);
        return MOCK_BIO_FEEDBACK;
    }
    try {
        const prompt = `Analyze this dating profile bio: "${bio}". Provide constructive feedback on how to improve it and also suggest a short, catchy "vibe" (2-3 words) that summarizes the personality.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: { type: Type.STRING },
                        vibe: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error getting profile feedback:", error);
        return MOCK_BIO_FEEDBACK;
    }
};

export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
    if (!ai) {
        await sleep(1500);
        // Return a placeholder image from picsum
        const randomId = Math.floor(Math.random() * 200);
        return `https://picsum.photos/id/${randomId}/1920/1080`;
    }
    try {
        const fullPrompt = `An atmospheric, aesthetic, abstract background image for a mobile app. Theme: ${prompt}. Use a beautiful color palette.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating background image:", error);
        return null;
    }
};
