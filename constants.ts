

export const OUTLINES_PROMPT_TEMPLATE = (title: string, concept: string, duration: number) => `
I want you to act as a Master Storyteller and YouTube Script Architect. Your specialty is creating gripping, first-person revenge stories with deep emotional stakes. Your mission is to take a simple video idea and structure it into a compelling chapter-by-chapter outline for a long-form video.

IMPORTANT: The language used in the title, chapter titles, and concepts MUST be extremely simple, clear, and easy for a 5th grader to understand. No complex vocabulary or sentence structures. Your entire response must strictly follow the format below. Do not add any extra text, explanation, or greetings.

First, you must understand the "Secret Formula" of these stories:

Emotional Core is Everything: The audience doesn't care about an HOA rule; they care about a good, hardworking person protecting their family's legacy. Chapter 1's entire job is to build this deep emotional connection to the hero and what they stand to lose.
The Deeper Conspiracy: The villain isn't just a mean neighbor; they are often running a larger criminal scheme (like embezzlement). The hero accidentally stumbles into this, raising the stakes from a simple dispute to a fight for justice.

Now, follow these steps to build the outline:

1. Refine the Title: Make the user's title more exciting, following the formula: [Villain's Action] — [Hero's Secret Power/Situation]! Keep it under 100 characters.

2. Calculate and Distribute Word Count: The rule is: 1 minute of video = 150 words. For a ${duration} minute video, the total word count for the entire script should be approximately ${duration * 150} words. Distribute this total word count across all chapters following these critical rules:
- Chapter 1 MUST have a word count between 400 and 500 words to establish the emotional core.
- The Hook is separate and will be written later (assume around 150 words).
- The remaining word count should be distributed intelligently among the other chapters (Chapter 2 onwards). The word count for these chapters can and should vary to best serve the story's pacing and narrative needs. The key is that the total sum of word counts for all chapters should equal the target total for the video.

3. Create the Chapters: Build the story with 5-12 chapters, depending on what best serves the story for the given duration. For each chapter, give it a title, a word count, and a simple concept.

Your response must be in this exact format:
---
Title: [Your Refined Title Here]

Chapter 0: The Hook
(Hook to be written later, following the high-action, first-person style).

Chapter 1: [Chapter 1 Title]
(Word Count: [Number between 400-500] words)
Concept: [A simple 2-3 sentence concept for this chapter.]

Chapter 2: [Chapter 2 Title]
(Word Count: [Number] words)
Concept: [A simple 2-3 sentence concept for this chapter.]

(And so on for all chapters...)
---

(Paste your information in the brackets below)

Title:
{
${title}
}

Summary/concept:
{
${concept}
}

Video duration:
{
${duration} minutes
}
`;

export const HOOK_PROMPT_TEMPLATE = (outlinesText: string) => `
I want you to act as an expert writer for viral, first-person YouTube revenge stories. Your job is to take the provided story outline and write a powerful, high-energy hook (120-150 words).

**CRITICAL RULES FOR WRITING THE HOOK:**

1.  **EXTREMELY SIMPLE ENGLISH:** The language must be incredibly simple. Imagine you are talking to a 10-year-old. Use common words and easy-to-understand ideas. This is the most important rule.

2.  **WRITING STYLE - SENTENCE FLOW:** You MUST use a mix of short and medium-length sentences. Do not write only short, choppy sentences. The writing should feel natural and powerful.
    *   **BAD STYLE (Too choppy):** "I had a big dream. I worked very hard for it. For many years, I worked day and night. I saved all my money. I wanted to buy a perfect house. Not just any house."
    *   **GOOD STYLE (Natural flow):** "I had a big dream that I worked incredibly hard for over many years. Working day and night, I saved all my money because I wanted to buy the perfect house. It couldn't be just any house, though; it had to be a special home for my family."

3.  **STARTING THE HOOK:** The hook MUST begin by directly identifying the villain and their action. Start the story in the middle of the most dramatic moment.
    *   **Correct example:** "This HOA president burned my house to the ground..."
    *   **Correct example:** "This corrupt landlord thought she could evict a war hero..."
    *   **Incorrect example:** "One night, the flames went high..."

4.  **ENDING THE HOOK:** The hook MUST end with a specific two-part phrase: first a question to the audience, then a call to comment.
    *   **Required format:** "Before we dive into the full story, what would you do if [a similar situation happened to you]? Let us know in the comments."

5.  **HERO'S VOICE & SECRET:** Write from the hero's first-person ("I", "me") point of view. The hook must reveal the hero's secret power or job and promise huge consequences for the villain.

Now, using the story outline below for context, write the hook following all of these rules precisely.

Here is the story outline:
---
${outlinesText}
---
`;

// FIX: Added missing prompt templates
export const CHAPTER_BATCH_PROMPT_TEMPLATE = (fullOutlinesText: string, chapters: { id: number; title: string; wordCount: number; concept: string }[]) => `
I want you to act as a Master Storyteller and YouTube Scriptwriter. Your specialty is writing gripping, first-person revenge stories with deep emotional stakes.

Your mission is to write the full script content for a batch of chapters, based on the provided story outline and chapter details.

**CRITICAL RULES FOR WRITING:**

1.  **FIRST-PERSON POV:** Write the entire script from the hero's first-person ("I", "me", "my") point of view.
2.  **EXTREMELY SIMPLE ENGLISH:** The language must be incredibly simple. Imagine you are talking to a 10-year-old. Use common words and easy-to-understand ideas. This is the most important rule.
3.  **WRITING STYLE - SENTENCE FLOW:** You MUST use a mix of short and medium-length sentences. Do not write only short, choppy sentences. The writing should feel natural and powerful, not robotic.
4.  **STICK TO THE CONCEPT:** Your writing for each chapter MUST strictly adhere to the provided concept and stay within the target word count.
5.  **SHOW, DON'T TELL:** Instead of saying "I was angry," describe the feeling: "My fists clenched so hard my knuckles turned white, and a hot rage boiled up inside my chest."
6.  **NO EXTRA TEXT:** Do NOT add any chapter titles, word count information, or any other text that is not part of the story's narrative itself. Only provide the raw script content for the chapters.
7.  **OUTPUT FORMAT:** You MUST separate the content of each chapter with exactly this delimiter: \`---CHAPTER-BREAK---\`. Do not use it at the beginning or end, only between chapters.

First, here is the full story outline for context:
---
${fullOutlinesText}
---

Now, write the full script content for the following chapters. Adhere strictly to their concepts and word counts.

${chapters.map(c => `
Chapter ${c.id}: ${c.title}
(Target Word Count: ${c.wordCount} words)
Concept: ${c.concept}
`).join('\n')}

Remember, your response should be ONLY the script content for these chapters, separated by \`---CHAPTER-BREAK---\`.
`;

export const THUMBNAIL_IDEAS_PROMPT_TEMPLATE = (title: string, hook: string) => `
I want you to act as a viral YouTube thumbnail designer and strategist. Your goal is to create compelling thumbnail ideas for a first-person revenge story video.

The output MUST be a JSON object that strictly follows this schema:
{
  "image_generation_prompt": "A detailed, ready-to-use image generation prompt for a cinematic thumbnail.",
  "text_on_thumbnail": "The exact, punchy, all-caps text to overlay on the thumbnail."
}

**RULES FOR CREATING THE IDEAS:**

1.  **Image Prompt:** The image generation prompt should be cinematic, high-contrast, and emotionally charged. Describe the scene, the lighting, the hero's expression, and the villain's action. It should be a prompt that an AI image generator like Midjourney or DALL-E can understand perfectly.
2.  **Thumbnail Text:** The text should be VERY short (2-5 words), all-caps, and incredibly punchy. It should create curiosity and highlight the core conflict. Use simple, powerful words.

Here is the context for the video:

**Video Title:** ${title}

**Video Hook:** ${hook}

Now, generate the JSON object with the thumbnail ideas. Your response MUST only contain the JSON object and nothing else.
`;

export const TITLES_DESCRIPTIONS_PROMPT_TEMPLATE = (originalTitle: string, fullScript: string) => `
I want you to act as a YouTube SEO and click-through-rate optimization expert. Your task is to generate 3 alternative, highly clickable packages of titles, descriptions, and hashtags for a video, based on its original title and full script.

The output MUST be a JSON array containing exactly 3 objects. Each object must strictly follow this schema:
{
  "title": "The video title, under 100 characters.",
  "description": "A 2-3 line summary of the video's story.",
  "hashtags": ["An array of 5 relevant hashtags, including #revenge and #storytime."]
}

**RULES FOR GENERATION:**

1.  **Titles:** Titles should be emotionally charged and create immense curiosity. They often follow patterns like "[Villain's Action] So I [Hero's Epic Revenge]". Keep them under 100 characters.
2.  **Descriptions:** Descriptions should be a short, compelling summary of the story's arc. Hook the reader and make them want to watch the whole thing.
3.  **Hashtags:** Include a mix of broad and specific hashtags. They MUST include #revenge and #storytime.

Here is the context:

**Original Video Title:**
${originalTitle}

**Full Video Script:**
---
${fullScript}
---

Now, generate the JSON array with the 3 title/description/hashtag packages. Your response MUST only contain the JSON array and nothing else.
`;
