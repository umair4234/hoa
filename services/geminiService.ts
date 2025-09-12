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
    }
  });

  const jsonText = extractJson(response.text);
  const data = JSON.parse(jsonText);
  
  if (!data.title_packages || !Array.isArray(data.title_packages)) {
    throw new Error("AI response for post-generation assets is missing 'title_packages' array.");
  }
  
  let packagesFromAI: any[] = data.title_packages;
  let finalPackages: any[] = [];
  
  // Find the package with the original title (case-insensitive search).
  const originalPackageIndex = packagesFromAI.findIndex(p => p.title && p.title.toLowerCase() === originalTitle.toLowerCase());

  if (originalPackageIndex > -1) {
    // If found, remove it from its current position and make it the first element.
    const originalPackage = packagesFromAI.splice(originalPackageIndex, 1)[0];
    // Also, ensure its title is exactly the original title, case-sensitively.
    originalPackage.title = originalTitle; 
    finalPackages = [originalPackage, ...packagesFromAI];
  } else {
    // If the AI completely failed to include the original title, log a warning
    // and force the first result's title to match the original.
    console.warn("AI did not generate a package for the original title as requested. Forcing the first title to match.");
    if (packagesFromAI.length > 0) {
        packagesFromAI[0].title = originalTitle;
    }
    finalPackages = packagesFromAI;
  }
  
  const titleDescriptionPackages: TitleDescriptionPackage[] = finalPackages.map((pkg: any, index: number) => ({
    id: index,
    title: pkg.title,
    description: pkg.description,
    hashtags: pkg.hashtags || [], // Ensure hashtags is always an array
    status: 'Unused',
  }));

  return {
    thumbnailIdeas: data.thumbnail_ideas,
    titleDescriptionPackages,
  };
};

export const generateThumbnailImage = async (
    prompt: string,
    text?: string,
    addText?: boolean,
    model?: string,
    baseImage?: string
): Promise<string> => {
    const activeModel = model || 'imagen-4.0-generate-001';

    if (activeModel === 'imagen-4.0-generate-001') {
        const response = await callImagenApi({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen API did not return an image.");
        }
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;

    } else { // 'gemini-2.5-flash-image-preview'
        const parts: any[] = [];
        if (baseImage) {
             // strip base64 prefix
            const base64Data = baseImage.substring(baseImage.indexOf(',') + 1);
            const mimeType = baseImage.substring(baseImage.indexOf(':') + 1, baseImage.indexOf(';'));
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            });
        }
        parts.push({ text: prompt });
        if (addText && text) {
            parts.push({ text: `Please add the following text to the image, stylized for a YouTube thumbnail: "${text}"`});
        }
        
        const response = await callGeminiApi({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        throw new Error("The model did not return an image.");
    }
};
