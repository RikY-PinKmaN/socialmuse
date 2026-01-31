import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AspectRatio, ContentGenerationResult, ImageResolution, Tone } from "../types";

// Helper to ensure we get a fresh instance with the latest key
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTextContent = async (
  idea: string, 
  tone: Tone,
  usePro: boolean
): Promise<ContentGenerationResult> => {
  const ai = getAIClient();
  
  // Use Gemini 3 Pro for paid/pro users, Gemini 3 Flash for standard/free users
  const model = usePro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemInstruction = `You are an expert social media manager. 
  Your task is to take a user's idea and generate optimized content for LinkedIn, Twitter (X), and Instagram.
  
  - Tone: ${tone}
  - LinkedIn: Professional, long-form, engaging, structured (use paragraphs).
  - Twitter: Short, punchy, under 280 chars, max 2 hashtags.
  - Instagram: Visual-focused caption, engaging, include a list of 10-15 relevant hashtags.
  
  ALSO, generate a detailed visual image prompt for each platform that matches the content's vibe.
  The image prompt should be descriptive for an AI image generator.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      linkedin: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The post text body" },
          imagePrompt: { type: Type.STRING, description: "Prompt for generating the accompanying image" }
        },
        required: ["content", "imagePrompt"]
      },
      twitter: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The tweet text" },
          imagePrompt: { type: Type.STRING, description: "Prompt for generating the accompanying image" }
        },
        required: ["content", "imagePrompt"]
      },
      instagram: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The caption text" },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hashtags" },
          imagePrompt: { type: Type.STRING, description: "Prompt for generating the accompanying image" }
        },
        required: ["content", "imagePrompt", "hashtags"]
      }
    },
    required: ["linkedin", "twitter", "instagram"]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: idea,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as ContentGenerationResult;
  } catch (error) {
    console.error("Error generating text content:", error);
    throw error;
  }
};

export const generateSocialImage = async (
  prompt: string, 
  aspectRatio: AspectRatio, 
  resolution: ImageResolution = '1K',
  usePro: boolean = false
): Promise<string> => {
  const ai = getAIClient();

  if (usePro) {
    // Pro Mode: Gemini 3 Pro Image
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: resolution
          }
        }
      });

      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
         for (const part of response.candidates[0].content.parts) {
           if (part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
           }
         }
      }
      throw new Error("No image data found in Pro response");
    } catch (error) {
       console.error("Pro Image Generation Error:", error);
       throw error;
    }
  } else {
    // Standard Mode: Try Gemini 2.5 Flash Image first
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
         for (const part of response.candidates[0].content.parts) {
           if (part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
           }
         }
      }
      throw new Error("No image data found in Flash response");
    } catch (error: any) {
      // Check for Permission Denied (403) or Not Found (404) indicating model unavailability
      // and fallback to Imagen 3 if possible
      if (error.status === 403 || error.status === 404 || error.code === 403 || (error.message && error.message.includes("permission"))) {
         console.warn("Gemini 2.5 Flash Image failed (Permission/Access), falling back to Imagen 3...");
         try {
           const response = await ai.models.generateImages({
             model: 'imagen-3.0-generate-001',
             prompt: prompt,
             config: {
               numberOfImages: 1,
               aspectRatio: aspectRatio,
               outputMimeType: 'image/jpeg'
             }
           });
           
           if (response.generatedImages && response.generatedImages.length > 0) {
              return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
           }
           throw new Error("No image returned from Imagen fallback");
         } catch (fallbackError) {
           console.error("Fallback Image Generation Error:", fallbackError);
           throw error; // Throw the original error or the fallback error? Throw original usually better context, but here fallback failed too.
         }
      }
      throw error;
    }
  }
};
