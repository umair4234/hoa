


export const OUTLINES_PROMPT_TEMPLATE = (title: string, concept: string, duration: number) => `
I want you to act as a Master Storyteller and YouTube Script Architect. Your mission is to structure a video idea into a compelling chapter-by-chapter outline, architected for maximum viewer retention. Your old instructions are outdated; follow this new guide precisely.

**Part 1: The Core Philosophy - Simple Language & Retention**
The goal is to front-load action and suspense. The audience clicked for the revenge plot, so we must deliver it quickly. Most importantly, the language used in the titles and concepts MUST be extremely simple, clear, and conversational, like an adult telling a story to another adult. Avoid complex or "literary" words.

**Part 2: The New Outline Blueprint: The 5 Story Beats**
You will structure the entire story around these five beats. Distribute the total word count (150 words per minute) to serve this new, fast-paced structure.

1.  **Beat 1: The Injustice (The Opener | ~15% of Script | First 1-2 chapters):** Must be short and concise. Its only job is to establish the hero, the villain, and the core injustice.
2.  **Beat 2: The Reveal (Early in the Script):** The chapter immediately following the setup. This is where the hero discovers or reveals their secret advantage or unique leverage. This MUST happen early.
3.  **Beat 3: The Plan (The Longest Section | ~50-60% of Script):** The heart of the story. The hero methodically uses their advantage to research the villain, gather evidence, and prepare their revenge. This can be multiple chapters.
4.  **Beat 4: The Climax (The Payoff):** The satisfying chapter where the revenge is executed in detail.
5.  **Beat 5: The Aftermath (The Conclusion | ~5% of Script):** A brief final chapter showing the resolution.

**Part 3: Critical Overriding Rules**
1.  **Antagonist:** The primary antagonist (the "HOA" villain archetype) MUST always be a woman.
2.  **Format:** Your entire response must strictly follow the format below. Do not add any extra text, explanation, or greetings.

---
**Your Task:**

1.  **Calculate Word Count:** Total words = ${duration} * 150. Distribute this total across all chapters, following the 5-beat structure percentages.
2.  **Create Chapters:** Build the story with 5-12 chapters, mapped to the 5 beats. For each chapter, provide a title, word count, and a simple concept using conversational language.

**Required Output Format:**
---
Chapter 0: The Hook
(Hook to be written later).

Chapter 1: [Chapter 1 Title - Start of Beat 1]
(Word Count: [Number] words)
Concept: [A simple 2-3 sentence concept for this chapter.]

Chapter 2: [Chapter 2 Title - Part of Beat 1 or Start of Beat 2]
(Word Count: [Number] words)
Concept: [A simple 2-3 sentence concept for this chapter.]

(And so on for all chapters, ensuring they map to the 5 beats...)
---

**User Input:**

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
I want you to act as an expert writer for viral, first-person YouTube revenge stories. Your job is to take the provided story outline and write a powerful, high-energy hook (120-150 words). Your previous instructions are obsolete. You must follow these new rules precisely.

**Part 1: The Core Rule - Use Extremely Simple, Conversational English**
Your single most important job is to use common, everyday words that a real person would use when telling a powerful story to a friend. The tone should be clear, direct, and authentic. Avoid "literary" or "novelistic" words.

**Example of the Required Language Shift (Study This):**

*   **INCORRECT (Too Complex):** "This audacious HOA president and her cronies demolished my cherished hunting cabin, reducing my sanctuary to rubble without warning... they made one colossal mistake... My entire professional life has been dedicated to upholding and dissecting the very legal systems they just shattered..."
*   **CORRECT (Simple, Natural & Powerful):** "This HOA president tore down my hunting cabin. It was my special place... She and her friends destroyed it without any warning... But they made a very big mistake... My whole life's work has been studying and protecting the very laws they just broke..."

Adopt the voice and simplicity of the "CORRECT" version precisely.

**Part 2: CRITICAL RULES FOR WRITING THE HOOK**

1.  **The Opening Sentence Rule (MANDATORY):** The hook MUST begin by identifying the villain and their core action. Use the format: "This [Adjective] [Villain]..."
2.  **The Hint (NO SPOILERS):** You MUST NOT reveal the hero's specific profession or secret power. You must HINT at their unique advantage or area of expertise.
3.  **The CTA and Promise:** Use a short, direct CTA, followed by a compelling promise.

**GOLD STANDARD HOOK TEMPLATE (Use this as your model):**
---
[START OF SCRIPT] This power-hungry HOA president tore down my hunting cabin using a fake reason, thinking she was just another homeowner she could scare. She destroyed the one place I felt at peace, ignoring the law because she thought she was in charge. But she made a very big mistake. She started a fight about property rules and paperwork, without ever knowing that my whole life's work is mastering that exact system.

But before we get to the rest of the story, make sure to like the video and subscribe so you don't miss what's next. Now, get ready, because you're about to see what happens when a mean person's fake documents go up against a true expert.
---

Now, using the story outline below for context, write the hook following all of these new rules precisely.

**Story Outline:**
---
${outlinesText}
---
`;

export const CHAPTER_BATCH_PROMPT_TEMPLATE = (fullOutlinesText: string, chapters: { id: number; title: string; wordCount: number; concept: string }[]) => `
I want you to act as a Master Storyteller and YouTube Scriptwriter. Your specialty is writing gripping, first-person revenge stories using simple, conversational language. Your previous instructions are outdated.

Your mission is to write the full script content for a batch of chapters based on the provided story outline and chapter details.

**CRITICAL RULES FOR WRITING (ALL CHAPTERS):**

1.  **SIMPLE, CONVERSATIONAL ENGLISH:** This is the most important rule. Use common, everyday words. The narration must sound like a real person telling a story to a friend. Avoid complex, "literary" vocabulary.
2.  **FIRST-PERSON POV:** Write the entire script from the hero's first-person ("I", "me", "my") point of view.
3.  **WRITING STYLE - SENTENCE FLOW:** You MUST use a mix of short and medium-length sentences to feel natural and powerful.
4.  **STICK TO THE CONCEPT:** Your writing for each chapter MUST strictly adhere to the provided concept and stay within the target word count.
5.  **SHOW, DON'T TELL:** Instead of saying "I was angry," describe the feeling: "My fists clenched, and I could feel my face getting hot."
6.  **NO EXTRA TEXT:** Do NOT add any chapter titles, word count information, or any other text that is not part of the story's narrative itself. Only provide the raw script content for the chapters.
7.  **OUTPUT FORMAT:** You MUST separate the content of each chapter with exactly this delimiter: \`---CHAPTER-BREAK---\`. Do not use it at the beginning or end, only between chapters.

---
**!!! CRITICAL INSTRUCTIONS FOR CHAPTER 1 !!!**
If you are asked to write Chapter 1, you MUST follow these rules with extreme precision. Chapter 1 must be a high-impact, seamless narrative continuation of the hook.

1.  **The Smooth Narrative Start Rule:** Chapter 1 must begin with a smooth, narrative opening that grounds the viewer in the story. Do NOT use conversational filler like 'Okay, so...' or 'Alright, let me tell you...'. Start directly with the story's setting and action.
2.  **Withhold the Secret:** Do NOT reveal the hero's specific job title in Chapter 1. Refer to it in general terms like "my stressful job," "my line of work," or "my career in law."
3.  **Simple, Conversational Flow:** Use the simple, natural language defined in the main rules.

**GOLD STANDARD CHAPTER 1 START TEMPLATE (Use this structure and style):**
---
"It was a Tuesday evening, a pretty normal night for us. My wife, [Wife's Name], had just gotten home from her job. She’s a [Noble Profession, e.g., Paramedic], so her days are full of emergencies and stress, and she was very tired. All we wanted was a quiet night at home to relax.

But then we heard a scream from next door. It was a real scream, from a real person in trouble. My wife knew right away it was our elderly neighbor, [Neighbor's Name].

She didn't even think. The [Professional Title] in her just took over. She jumped up, said our neighbor had a bad heart and that she had to go, and ran out the door with her keys.

In an emergency like that, every second counts. Our driveway is long, and backing out would take too much time. So she did the fastest thing possible: she drove her car right over the lawn and parked it with two wheels on the curb, right by the neighbor's door.

Now, while this was happening, our other neighbor, [The Villain's Name], was watching from her window. But she didn't see an emergency. All she saw was a car parked the wrong way. And while my wife was inside, trying to save a life, [The Villain's Name] picked up her phone. She wasn't calling for help. She was calling a tow truck. It’s just hard to believe someone could be so cold."
---
---

First, here is the full story outline for context:
---
${fullOutlinesText}
---

Now, write the full script content for the following chapters. Adhere strictly to their concepts, word counts, and any special chapter-specific instructions above.

${chapters.map(c => `
Chapter ${c.id}: ${c.title}
(Target Word Count: ${c.wordCount} words)
Concept: ${c.concept}
`).join('\n')}

Remember, your response should be ONLY the script content for these chapters, separated by \`---CHAPTER-BREAK---\`.
`;

export const POST_GENERATION_ASSETS_PROMPT_TEMPLATE = (originalTitle: string, fullScript: string) => `
I want you to act as a YouTube SEO, viral marketing, and click-through-rate optimization expert. Your task is to generate a complete package of post-production assets for a YouTube video based on its title and full script.

The output MUST be a single JSON object that strictly follows this schema:
{
  "thumbnail_ideas": {
    "image_generation_prompt": "A detailed, ready-to-use image generation prompt for a cinematic thumbnail.",
    "text_on_thumbnail": "The exact, punchy, all-caps text to overlay on the thumbnail (2-5 words)."
  },
  "original_title_assets": {
    "description": "A 2-3 line summary of the video's story, optimized for the original title.",
    "hashtags": ["An array of 5 relevant hashtags, including #revenge and #storytime."]
  },
  "alternative_title_packages": [
    {
      "title": "Alternative Title 1, under 100 characters.",
      "description": "A 2-3 line summary optimized for this alternative title.",
      "hashtags": ["An array of 5 relevant hashtags for this title."]
    },
    {
      "title": "Alternative Title 2, under 100 characters.",
      "description": "A 2-3 line summary optimized for this alternative title.",
      "hashtags": ["An array of 5 relevant hashtags for this title."]
    }
  ]
}

**RULES FOR GENERATION:**

1.  **Thumbnail Image Prompt:** The prompt should be cinematic, high-contrast, and emotionally charged. Describe the scene, lighting, hero's expression, and villain's action for an AI image generator.
2.  **Thumbnail Text:** Text must be VERY short (2-5 words), all-caps, and incredibly punchy to create curiosity.
3.  **Original Title Assets:** For the provided original title, create a compelling description and relevant hashtags.
4.  **Alternative Titles:** Generate two alternative titles that are emotionally charged and follow patterns like "[Villain's Action] So I [Hero's Epic Revenge]". Keep them under 100 characters.
5.  **Alternative Descriptions/Hashtags:** Each alternative title needs its own tailored description and set of hashtags.

Here is the context:

**Original Video Title:**
${originalTitle}

**Full Video Script:**
---
${fullScript}
---

Now, generate the single JSON object with all the assets. Your response MUST only contain the JSON object and nothing else.
`;