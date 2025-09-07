export interface ChapterOutline {
  id: number;
  title: string;
  wordCount: number;
  concept: string;
}

export enum AppStep {
  INITIAL,
  OUTLINES_GENERATED,
  HOOK_GENERATED,
}

export enum GenerationStatus {
  IDLE,
  RUNNING,
  PAUSED,
  DONE,
}

// New types for Library
export type AppView = 'WORKSPACE' | 'LIBRARY' | 'SPLITTER';

export type JobStatus = 'WRITING' | 'PAUSED' | 'DONE' | 'FAILED';

export type LibraryStatus = 'AVAILABLE' | 'ARCHIVED';

export interface TitleDescriptionPackage {
  id: number;
  title: string;
  description: string;
  hashtags: string[];
  status: 'Used' | 'Unused';
  usedAt?: number;
}

export interface ThumbnailIdeas {
  image_generation_prompt: string;
  text_on_thumbnail: string;
}

export interface SplitSection {
  content: string;
  copied: boolean;
}

export interface ScriptJob {
  id: string;
  source: 'MANUAL';
  title: string;
  concept: string;
  duration: number;
  status: JobStatus;
  createdAt: number;
  error?: string;
  rawOutlineText: string;
  refinedTitle: string;
  outlines: ChapterOutline[];
  hook: string;
  chaptersContent: string[];
  currentTask?: string;
  libraryStatus: LibraryStatus;
  thumbnailIdeas?: ThumbnailIdeas;
  thumbnailImageUrls?: string[];
  titleDescriptionPackages?: TitleDescriptionPackage[];
  // New properties for Splitter
  splitterText?: string;
  splitSections?: SplitSection[];
  maxCharsPerSection?: number;
}