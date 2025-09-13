


export const THUMBNAIL_IDEAS_STYLE_GUIDE = `{
  "style_profile": {
    "visual_style": "hyper-realistic cinematic still",
    "emotional_tone": "high-conflict, dramatic, triumphant",
    "composition": "dynamic three-point action (aggressor, victim, reactor), characters fill the frame",
    "lighting": "bright, hard, outdoor daylight creating high contrast and sharp shadows",
    "color_palette": "highly saturated and vivid (strong blues, reds, greens)",
    "focus_and_clarity": "deep depth of field, everything is tack sharp, no motion blur or bokeh",
    "typography": {
      "font": "heavy, bold, sans-serif (e.g., Impact, Anton)",
      "case": "all-caps",
      "color": "bright yellow",
      "effect": "heavy black outline or drop shadow",
      "content": "short, quoted dialogue (2-5 words)",
      "placement": "top, bottom, or flanking characters"
    },
    "graphic_overlays": "use of simple red arrows and/or red circles to direct viewer's attention to a key character or detail"
  },
  "archetypes": [
    {
      "name": "Authority Reversal",
      "description": "An antagonist wrongfully uses perceived authority (e.g., a fake HOA cop) against a protagonist, only to be shocked when the protagonist reveals a superior, legitimate authority (e.g., real police, FBI, military).",
      "key_elements": ["Antagonist in action", "Protagonist calm or revealing their status", "Shocked expression on antagonist"]
    },
    {
      "name": "The Hidden Protector",
      "description": "An antagonist attacks a seemingly vulnerable person, unaware that the victim's protector (e.g., a Navy SEAL spouse, trained K9s) is present and about to intervene with overwhelming force.",
      "key_elements": ["Antagonist mid-aggression", "Victim in distress", "Powerful protector entering the frame or revealed in the background"]
    },
    {
      "name": "Smug Escalation",
      "description": "An antagonist commits an over-the-top act of aggression (e.g., smashing property) while the protagonist looks on, not with fear, but with smug confidence, implying the antagonist has fallen into a trap.",
      "key_elements": ["Destructive action in progress", "Smug or calm protagonist", "Hint of an impending, unexpected consequence"]
    }
  ],
  "decision_flow": [
    "1. Analyze the title to identify the core conflict: Who is the aggressor? Who is the victim?",
    "2. Identify the 'twist' or hidden power: Is it a job (FBI, Cop)? Is it a person (Navy SEAL)? Or is it a trap?",
    "3. If the twist is a job/status reveal, select the 'Authority Reversal' archetype.",
    "4. If the twist is a powerful person intervening, select the 'The Hidden Protector' archetype.",
    "5. If the twist involves the antagonist's action backfiring, select the 'Smug Escalation' archetype."
  ],
  "thumbnail_variations": [
    {
      "variation_id": "v1",
      "confidence": 0.95,
      "summary": "High-impact scene showing the FBI husband revealing his badge during the wife's wrongful arrest, shocking the HOA.",
      "nanobanana_prompt": "Hyper-realistic dramatic scene. An arrogant HOA woman {image_1} looks shocked as she handcuffs a distressed wife {image_2}. In the foreground, an FBI agent's hand holds up a badge, intervening. Set in a suburban driveway.",
      "json_prompt": {
        "characters": [
          {
            "reference_image": "image_1",
            "role": "HOA",
            "action": "mid-arrest, holding handcuffs, face is a mask of shock and disbelief, looking towards the FBI agent"
          },
          {
            "reference_image": "image_2",
            "role": "Wife",
            "action": "looking relieved and defiant, hands partially cuffed, standing next to the HOA"
          },
          {
            "reference_image": "image_3",
            "role": "FBI Husband",
            "action": "Only his arm and chest are visible from the right side of the frame. He is wearing a suit and holding up an FBI badge and credentials. His expression is unseen but his presence is dominant."
          }
        ],
        "background": "bright, sunny suburban street with manicured lawns and houses",
        "camera": "medium shot, eye-level, wide-angle lens feel (24mm) to capture all characters and the environment",
        "lighting": "hard, direct sunlight from the top-right, creating sharp shadows and high contrast",
        "style_details": {
          "realism": "hyper-realistic",
          "saturation": "vivid",
          "contrast": "high",
          "sharpness": "very_sharp",
          "clarity": "no_blur",
          "noise_level": "low"
        },
        "overlays": [
          {
            "type": "text",
            "content": "\\"HE'S FBI?!\\"",
            "position": "top-center",
            "max_words": 3
          },
          {
            "type": "arrow",
            "position": "pointing from text to the FBI badge"
          }
        ],
        "aspect_ratio": "16:9",
        "resolution": "1280x720",
        "safe_text_margin": 0.06
      },
      "asset_instructions": {
        "image_1_pose": "full or 3/4 body, hands forward, must capture a shocked facial expression",
        "image_2_pose": "full or 3/4 body, hands together as if cuffed, relieved or defiant expression",
        "lighting_notes": "all subjects must be lit by the same hard, top-right light source",
        "crop": "crop to a medium shot that includes all three story elements (HOA, Wife, Badge)",
        "extra_assets": [
          "FBI_husband_asset (arm in suit holding badge)",
          "red_arrow_asset"
        ]
      },
      "reason": "This 'Authority Reversal' perfectly matches the core twist of the title and the high-drama style of the samples.",
      "no_blur_assertion": "image must have no blur, no bokeh, ultra sharp"
    },
    {
      "variation_id": "v2",
      "confidence": 0.85,
      "summary": "A clear, readable scene focusing on the wife's arrest, with the ominous FBI husband approaching in the background.",
      "nanobanana_prompt": "Photorealistic scene of an angry HOA woman {image_1} arresting a defiant wife {image_2} on a sidewalk. In the background, a determined man in a suit (the FBI husband) is purposefully walking towards them.",
      "json_prompt": {
        "characters": [
          {
            "reference_image": "image_1",
            "role": "HOA",
            "action": "aggressively putting handcuffs on the wife, snarling expression, center-left"
          },
          {
            "reference_image": "image_2",
            "role": "Wife",
            "action": "stoic and unbroken, looking directly at the camera, center-right"
          },
          {
            "reference_image": "image_3",
            "role": "FBI Husband",
            "action": "in the background, walking towards the scene with intense focus, partially obscured"
          }
        ],
        "background": "clean, modern suburban neighborhood street on a sunny day",
        "camera": "standard shot (35mm feel), focused on the two women in the midground, with the husband in the background",
        "lighting": "bright overhead sunlight, creating strong highlights and defined shadows",
        "style_details": {
          "realism": "photoreal",
          "saturation": "vivid",
          "contrast": "high",
          "sharpness": "very_sharp",
          "clarity": "no_blur",
          "noise_level": "low"
        },
        "overlays": [
          {
            "type": "text",
            "content": "\\"BIG MISTAKE\\"",
            "position": "bottom-center",
            "max_words": 2
          },
          {
            "type": "circle",
            "position": "around the approaching FBI husband in the background"
          }
        ],
        "aspect_ratio": "16:9",
        "resolution": "1280x720",
        "safe_text_margin": 0.06
      },
      "asset_instructions": {
        "image_1_pose": "3/4 body shot, profile or 3/4 turn, angry expression, hands active",
        "image_2_pose": "3/4 body shot, facing forward, calm but defiant expression",
        "lighting_notes": "match the bright overhead sun for all characters",
        "crop": "Frame the two women as the primary subjects, ensuring the husband is clearly visible but in the background",
        "extra_assets": [
          "FBI_husband_asset (full body, walking)",
          "red_circle_asset"
        ]
      },
      "reason": "This 'Hidden Protector' archetype builds suspense and clearly communicates the story with classic visual hierarchy.",
      "no_blur_assertion": "image must have no blur, no bokeh, ultra sharp"
    },
    {
      "variation_id": "v3",
      "confidence": 0.75,
      "summary": "An experimental aftermath scene where the tables are turned: the HOA is being arrested by the FBI husband.",
      "nanobanana_prompt": "Hyper-realistic image, tables turned. An FBI agent {image_3} is arresting a defeated-looking HOA woman {image_1}. His vindicated wife {image_2} stands beside him, arms crossed and smiling.",
      "json_prompt": {
        "characters": [
          {
            "reference_image": "image_1",
            "role": "HOA",
            "action": "being handcuffed, looking down in shame and defeat, center of frame"
          },
          {
            "reference_image": "image_2",
            "role": "Wife",
            "action": "standing to the right, arms crossed, with a small, triumphant smile"
          },
          {
            "reference_image": "image_3",
            "role": "FBI Husband",
            "action": "standing to the left, back partially to camera, wearing an 'FBI' jacket, applying handcuffs to the HOA"
          }
        ],
        "background": "front door of a nice suburban house, late afternoon sun",
        "camera": "medium close-up, focusing on the defeated expression of the HOA",
        "lighting": "warm, late afternoon light (golden hour) from the side to create dramatic modeling on faces",
        "style_details": {
          "realism": "hyper-realistic",
          "saturation": "vivid",
          "contrast": "high",
          "sharpness": "very_sharp",
          "clarity": "no_blur",
          "noise_level": "low"
        },
        "overlays": [
          {
            "type": "text",
            "content": "\\"SHE MESSED WITH THE FBI\\"",
            "position": "top-center",
            "max_words": 5
          }
        ],
        "aspect_ratio": "16:9",
        "resolution": "1280x720",
        "safe_text_margin": 0.06
      },
      "asset_instructions": {
        "image_1_pose": "3/4 body, looking down, hands behind back, sad/defeated expression",
        "image_2_pose": "3/4 body, arms crossed, confident and smiling expression",
        "lighting_notes": "all characters should be lit by a warm, directional light from the side",
        "crop": "Focus on the interaction, ensuring the HOA's defeated face is a key focal point",
        "extra_assets": [
          "FBI_husband_asset (back view, wearing FBI jacket)"
        ]
      },
      "reason": "This experimental option shows the triumphant resolution rather than the conflict, which could be an effective clickbait alternative.",
      "no_blur_assertion": "image must have no blur, no bokeh, ultra sharp"
    }
  ],
  "compact_style_summary": "The style is 'cinematic confrontation'. It uses hyper-realistic, brightly lit, high-contrast outdoor scenes of peak conflict. Characters display extreme emotions (rage, shock, smugness). Always overlay bold, all-caps yellow text in quotes with a heavy black outline, and use red arrows/circles to direct the viewer's eye to the story's twist.",
  "cursor_integration": {
    "feature_description": "Implement a 'Get Thumbnail Ideas' button within the script editor. When clicked, this function will use the script's title and hook to generate 3 style-consistent thumbnail variations.",
    "workflow": [
      "1. On button click, extract the \`target_title\` and \`target_hook\` from the current script.",
      "2. Pass these, along with this JSON object (as the \`style_profile\`), to the generation function.",
      "3. The function uses the \`decision_flow\` to recommend an \`archetype\`.",
      "4. The function then presents the 3 \`thumbnail_variations\` to the user.",
      "5. When a user selects a variation, the UI prompts them to upload assets as specified in \`asset_instructions\` (e.g., 'Upload photo for HOA', 'Upload photo for Wife').",
      "6. The app replaces placeholders like \`{image_1}\` and \`{image_2}\` in the \`nanobanana_prompt\` with the paths to the uploaded images.",
      "7. The app calls the image generation API (e.g., NanoBanana) using the populated \`nanobanana_prompt\` or, for more control, the structured \`json_prompt\`.",
      "8. The app overlays text and graphics as defined in the \`overlays\` array.",
      "9. Final checks are performed to ensure resolution is 1280x720, aspect ratio is 16:9, and the image is sharp, respecting the \`safe_text_margin\`."
    ],
    "placeholder_replacement": "Use the \`characters\` array within each variation's \`json_prompt\` to map roles to placeholders. For \`v1\`, \`{image_1}\` is the 'HOA', \`{image_2}\` is the 'Wife', and an additional asset is needed for the 'FBI Husband'.",
    "pseudocode_example": "function generateThumbnailIdeas(target_title, target_hook, style_profile_json) {\\n  // 1. Log the compact style summary for reference\\n  console.log(style_profile_json.compact_style_summary);\\n\\n  // 2. Present thumbnail variations to the user\\n  const user_choice = presentUI(style_profile_json.thumbnail_variations);\\n\\n  // 3. Get required image assets from the user\\n  const image_1_path = uploadAsset(user_choice.asset_instructions.image_1_pose);\\n  const image_2_path = uploadAsset(user_choice.asset_instructions.image_2_pose);\\n\\n  // 4. Populate the prompt\\n  let prompt = user_choice.nanobanana_prompt;\\n  prompt = prompt.replace('{image_1}', image_1_path);\\n  prompt = prompt.replace('{image_2}', image_2_path);\\n\\n  // 5. Generate the base image\\n  const generated_image = callNanoBananaAPI(prompt);\\n\\n  // 6. Apply overlays and checks\\n  const final_thumbnail = applyOverlaysAndChecks(generated_image, user_choice.json_prompt);\\n\\n  return final_thumbnail;\\n}"
  }
}`;

export const THUMBNAIL_IDEAS_PROMPT_TEMPLATE = (title: string, hook: string) => `
You are a world-class YouTube thumbnail strategist. Your sole mission is to generate three distinct, high-impact thumbnail concepts for a given video title and hook. You MUST strictly adhere to the provided style guide.

**Input:**
1.  **Style Guide (JSON):** A comprehensive definition of the required visual style, archetypes, and decision-making logic. You MUST follow this exactly.
2.  **Video Title:** The main title of the video.
3.  **Video Hook:** The opening paragraph(s) of the video script.

**Task:**
1.  Analyze the provided **Video Title** and **Video Hook** to understand the core conflict, the characters (hero/villain), and the "twist" or power dynamic.
2.  Use the \`decision_flow\` from the **Style Guide** to select the most appropriate \`archetype\` for the story.
3.  Generate three unique thumbnail ideas inspired by the \`thumbnail_variations\` examples in the Style Guide.
4.  For each idea, you must provide a summary, the text overlay, and a detailed image generation prompt.

**CRITICAL OUTPUT FORMAT:**
Your response MUST be a single, valid JSON object. Do not include any text, markdown, or explanations outside of the JSON object. The object should contain a single key, "ideas", which is an array of three objects. Each object in the array must have the following keys:
- \`summary\`: A brief summary of the thumbnail concept.
- \`textOverlay\`: The exact, punchy, all-caps text for the thumbnail overlay (2-5 words).
- \`imageGenerationPrompt\`: The detailed image generation prompt (for NanoBanana/gemini-2.5-flash-image-preview).

**Example JSON Output Structure:**
\`\`\`json
{
  "ideas": [
    {
      "summary": "High-impact scene showing the FBI husband revealing his badge during the wife's wrongful arrest, shocking the HOA.",
      "textOverlay": "HE'S FBI?!",
      "imageGenerationPrompt": "Hyper-realistic dramatic scene. An arrogant HOA woman {image_1} looks shocked as she handcuffs a distressed wife {image_2}. In the foreground, an FBI agent's hand holds up a badge, intervening. Set in a suburban driveway."
    },
    {
      "summary": "A clear, readable scene focusing on the wife's arrest, with the ominous FBI husband approaching in the background.",
      "textOverlay": "BIG MISTAKE",
      "imageGenerationPrompt": "Photorealistic scene of an angry HOA woman {image_1} arresting a defiant wife {image_2} on a sidewalk. In the background, a determined man in a suit (the FBI husband) is purposefully walking towards them."
    },
    {
      "summary": "An experimental aftermath scene where the tables are turned: the HOA is being arrested by the FBI husband.",
      "textOverlay": "SHE MESSED WITH THE FBI",
      "imageGenerationPrompt": "Hyper-realistic image, tables turned. An FBI agent {image_3} is arresting a defeated-looking HOA woman {image_1}. His vindicated wife {image_2} stands beside him, arms crossed and smiling."
    }
  ]
}
\`\`\`

---

**Style Guide:**
${THUMBNAIL_IDEAS_STYLE_GUIDE}

---

**Video Title:**
${title}

---

**Video Hook:**
${hook}
`;

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
  "title_packages": [
    {
      "title": "This title MUST be the exact same as the 'Original Video Title' provided in the input.",
      "description": "A 2-3 line summary of the video's story, written specifically for the original title.",
      "hashtags": ["An array of 5 relevant hashtags for the original title, including #revenge and #storytime."]
    },
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

1.  **Title Packages:** Generate three packages. The first package MUST use the exact original title provided below. The other two packages should contain new, alternative titles.
2.  **Alternative Titles:** Generate two alternative titles that are emotionally charged and follow patterns like "[Villain's Action] So I [Hero's Epic Revenge]". Keep them under 100 characters.
3.  **Descriptions/Hashtags:** Each title package needs its own tailored description and set of hashtags.

Here is the context:

**Original Video Title:**
${originalTitle}

**Full Video Script:**
---
${fullScript}
---

Now, generate the single JSON object with all the assets. Your response MUST only contain the JSON object and nothing else.
`;
