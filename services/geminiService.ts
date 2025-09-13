import { Modality, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChapterOutline, GeneratedThumbnailIdea, TitleDescriptionPackage } from "../types";
import { OUTLINES_PROMPT_TEMPLATE, HOOK_PROMPT_TEMPLATE, CHAPTER_BATCH_PROMPT_TEMPLATE, POST_GENERATION_ASSETS_PROMPT_TEMPLATE, THUMBNAIL_IDEAS_PROMPT_TEMPLATE } from "../constants";
import { callGeminiApi } from "./apiService";

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
): Promise<{ titleDescriptionPackages: TitleDescriptionPackage[] }> => {
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
    titleDescriptionPackages,
  };
};


export const generateThumbnailIdeas = async (
  title: string,
  hook: string
): Promise<GeneratedThumbnailIdea[]> => {
  const prompt = THUMBNAIL_IDEAS_PROMPT_TEMPLATE(title, hook);
  const response = await callGeminiApi({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const jsonText = extractJson(response.text);
  const data = JSON.parse(jsonText);

  if (!data.ideas || !Array.isArray(data.ideas)) {
    throw new Error("AI response for thumbnail ideas is missing 'ideas' array or is in the wrong format.");
  }

  // Basic validation that we got what we expected
  const ideas: GeneratedThumbnailIdea[] = data.ideas.map((idea: any) => {
    if (!idea.summary || !idea.textOverlay || !idea.imageGenerationPrompt) {
      throw new Error("Received thumbnail idea object is missing required fields (summary, textOverlay, imageGenerationPrompt).");
    }
    return {
      summary: idea.summary,
      textOverlay: idea.textOverlay,
      imageGenerationPrompt: idea.imageGenerationPrompt,
    };
  });

  return ideas;
};
