import { Modality, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChapterOutline, ThumbnailIdeas, TitleDescriptionPackage } from "../types";
import { OUTLINES_PROMPT_TEMPLATE, HOOK_PROMPT_TEMPLATE, CHAPTER_BATCH_PROMPT_TEMPLATE, POST_GENERATION_ASSETS_PROMPT_TEMPLATE } from "../constants";
import { callGeminiApi, callImagenApi } from "./apiService";

// Helper to extract JSON from a string, removing markdown fences if they exist.
const extractJson = (text: string): string => {
  // Look for a JSON block within markdown fences
  const match = text.match(/```(json)?\s*([\s\S]+?)\s*```/);
  if (match && match[2]) {
    return match[2].trim();
  }
  // If no fences, assume the whole text is the JSON
  return text.trim();
};

export const generateOutlines = async (title: string, concept: string, duration: number): Promise<string> => {
  const prompt = OUTLINES_PROMPT_TEMPLATE(title, concept, duration);
  const response = await callGeminiApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateHook = async (outlinesText: string): Promise<string> => {
  const prompt = HOOK_PROMPT_TEMPLATE(outlinesText);
  const response = await callGeminiApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateChapterBatch = async (
  fullOutlinesText: string,
  chapters: ChapterOutline[]
): Promise<string[]> => {
  if (chapters.length === 0) return [];
  
  const prompt = CHAPTER_BATCH_PROMPT_TEMPLATE(fullOutlinesText, chapters);
  const response = await callGeminiApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const content = response.text;
  const chapterContents = content.split('---CHAPTER-BREAK---').map(c => c.trim());
  
  if (chapterContents.length !== chapters.length) {
    console.error("Mismatch between requested and generated chapters.", {
      requested: chapters.length,
      received: chapterContents.length,
    });
  }
  
  return chapterContents;
};

export const generatePostGenerationAssets = async (
  originalTitle: string,
  fullScript: string
): Promise<{ thumbnailIdeas: ThumbnailIdeas; titleDescriptionPackages: TitleDescriptionPackage[] }> => {
  const prompt = POST_GENERATION_ASSETS_PROMPT_TEMPLATE(originalTitle, fullScript);
  const response = await callGeminiApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thumbnail_ideas: {
            type: Type.OBJECT,
            properties: {
              image_generation_prompt: { type: Type.STRING },
              text_on_thumbnail: { type: Type.STRING }
            },
            required: ['image_generation_prompt', 'text_on_thumbnail']
          },
          original_title_assets: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['description', 'hashtags']
          },
          alternative_title_packages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'description', 'hashtags']
            }
          }
        },
        required: ['thumbnail_ideas', 'original_title_assets', 'alternative_title_packages']
      }
    }
  });

  try {
    const jsonStr = extractJson(response.text);
    const parsed = JSON.parse(jsonStr);

    const thumbnailIdeas: ThumbnailIdeas = parsed.thumbnail_ideas;

    const originalPackage: TitleDescriptionPackage = {
      id: 1,
      title: originalTitle,
      description: parsed.original_title_assets.description,
      hashtags: parsed.original_title_assets.hashtags,
      status: 'Unused',
    };

    const alternativePackages: TitleDescriptionPackage[] = parsed.alternative_title_packages.map((item: any, index: number) => ({
      ...item,
      id: index + 2, // Start IDs from 2
      status: 'Unused'
    }));

    const titleDescriptionPackages = [originalPackage, ...alternativePackages];

    return { thumbnailIdeas, titleDescriptionPackages };
  } catch (error) {
    console.error("Failed to parse post-generation assets JSON:", error, "Raw text:", response.text);
    throw new Error("Could not parse the assets from the AI response.");
  }
};

function fileToGenerativePart(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  const mimeType = match[1];
  const data = match[2];
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
}

export const generateThumbnailImage = async (
  prompt: string,
  textOverlay: string,
  addTextOverlay: boolean,
  model: 'gemini-2.5-flash-image-preview' | 'imagen-4.0-generate-001',
  baseImage?: string
): Promise<string> => {
  if (model === 'imagen-4.0-generate-001') {
    if (baseImage) {
      throw new Error("Imagen 4.0 does not support image editing/variations.");
    }

    const response = await callImagenApi({
      model: 'imagen-4.0-generate-001',
      prompt: prompt, // Text overlay is not reliable with Imagen
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } else { // gemini-2.5-flash-image-preview
    let fullPrompt = prompt;

    if (!baseImage && addTextOverlay) {
      // For initial generation with text.
      fullPrompt = `${prompt}. The image MUST have the following text prominently displayed on it, in a large, bold, easy-to-read font, styled like a viral YouTube thumbnail: "${textOverlay}"`;
    } else if (baseImage) {
      // For variations, the prompt is just the edit instruction.
      fullPrompt = prompt;
    }

    if (!baseImage) {
      fullPrompt = `${fullPrompt} The image must be in a 16:9 aspect ratio, with a resolution of 1280x720 pixels.`;
    }

    const parts: any[] = [];
    if (baseImage) {
      parts.push(fileToGenerativePart(baseImage));
    }
    parts.push({ text: fullPrompt });

    const response = await callGeminiApi({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      console.error("Image generation response did not contain an image part:", response);
      const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
      const blockReason = response.promptFeedback?.blockReason;
      let detailedError = "Image generation failed to return an image.";
      if (blockReason) {
        detailedError += ` The request was blocked for: ${blockReason}.`;
      }
      if (textPart?.text) {
        detailedError += ` The model responded with: "${textPart.text}"`;
      }
      throw new Error(detailedError);
    }

    const { mimeType, data } = imagePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  }
};