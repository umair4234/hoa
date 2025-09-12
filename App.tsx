
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Button from './components/Button';
import ApiKeyManager from './components/ApiKeyManager';
import GearIcon from './components/GearIcon';
import ManualProgressTracker from './components/ManualProgressTracker';
import CopyControls from './components/CopyControls';
import InlineLoader from './components/InlineLoader';
import GenerationControls from './components/GenerationControls';
import PasswordProtection from './components/PasswordProtection';
import ThumbnailIdeasModal from './components/ThumbnailIdeasModal';
import Loader from './components/Loader';
import ScriptSplitter from './components/ScriptSplitter';
import TitleDescriptionManager from './components/TitleDescriptionManager';


import { 
  generateOutlines, 
  generateHook, 
  generateChapterBatch,
  generatePostGenerationAssets,
  generateThumbnailImage
} from './services/geminiService';
import { auth } from './services/firebase';
// FIX: Removed incorrect namespace import and added named import for User type.
import { User } from "firebase/auth";

import { 
  ScriptJob, 
  ChapterOutline, 
  GenerationStatus, 
  AppView, 
  JobStatus, 
  TitleDescriptionPackage,
  LibraryStatus
} from './types';

// Helper to create a simple unique ID
const createUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Helper to count words
const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// Robust parser for the outline format from the AI
const parseOutlines = (rawText: string): { outlines: ChapterOutline[] } => {
    const text = rawText.replace(/^---/, '').trim();
    const outlines: ChapterOutline[] = [];

    // Split by "Chapter X:" but keep the delimiter and filter out empty strings
    const chapterBlocks = text.split(/\n?(?=Chapter \d+:)/).filter(block => block.trim());

    chapterBlocks.forEach((block) => {
        const idMatch = block.match(/^Chapter (\d+):/);
        const titleMatch = block.match(/^Chapter \d+:\s*(.*)/);
        const wordCountMatch = block.match(/\(Word Count:\s*(\d+)/);
        const conceptMatch = block.match(/Concept:\s*([\s\S]*)/);

        if (idMatch && titleMatch && wordCountMatch && conceptMatch) {
            outlines.push({
                id: parseInt(idMatch[1], 10),
                title: titleMatch[1].trim(),
                wordCount: parseInt(wordCountMatch[1], 10),
                concept: conceptMatch[1].trim()
            });
        } else if (!block.includes("Chapter 0")) {
             // Don't warn for the hook placeholder ("Chapter 0")
            console.warn(`Could not fully parse a chapter block:`, `"${block}"`);
        }
    });

    if (outlines.length === 0 && text.length > 0) {
        throw new Error("Failed to parse script outlines from AI response. The format may have been incorrect.");
    }

    return { outlines };
};


const App: React.FC = () => {
  // --- AUTH & CONFIG ---
  // FIX: Use the imported User type directly, not from a namespace.
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);

  // --- APP STATE & VIEW ---
  const [jobs, setJobs] = useState<ScriptJob[]>([]);
  const jobsRef = useRef<ScriptJob[]>([]); // Initialize with empty; will be manually synced.
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [view, setView] = useState<AppView>('WORKSPACE');
  const [libraryFilter, setLibraryFilter] = useState<LibraryStatus>('AVAILABLE');

  // --- FORM STATE ---
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('');
  const [duration, setDuration] = useState('10');
  const [formError, setFormError] = useState('');

  // --- GENERATION PROCESS STATE ---
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const generationStatusRef = useRef<GenerationStatus>(GenerationStatus.IDLE); // Ref for control inside async generator
  const [currentTask, setCurrentTask] = useState('');
  const [progress, setProgress] = useState({ wordsWritten: 0, totalWords: 0 });

  // --- MODAL STATE ---
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [isPostGenAssetsLoading, setIsPostGenAssetsLoading] = useState(false);
  const [isLoadingThumbnailImage, setIsLoadingThumbnailImage] = useState(false);
  const [isTitleDescModalOpen, setIsTitleDescModalOpen] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('gemini_api_keys');
    if (savedApiKeys) {
      setApiKeys(JSON.parse(savedApiKeys));
    }
    const savedJobs = localStorage.getItem('script_jobs');
    if (savedJobs) {
      let parsedJobs: ScriptJob[] = JSON.parse(savedJobs);
      // Data migration for older jobs that might not have libraryStatus
      parsedJobs = parsedJobs.map(job => ({
          ...job,
          libraryStatus: job.libraryStatus || 'AVAILABLE'
      }));
      setJobs(parsedJobs);
      jobsRef.current = parsedJobs;
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gemini_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);
  useEffect(() => {
    localStorage.setItem('script_jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Firebase auth listener
  useEffect(() => {
    // FIX: Use the v8/compat `auth.onAuthStateChanged` method.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find(job => job.id === selectedJobId) || null;
  }, [selectedJobId, jobs]);
  
  const totalWords = useMemo(() => {
      if (!selectedJob) return 0;
      const hookWords = countWords(selectedJob.hook || '');
      const chapterWords = selectedJob.chaptersContent.reduce((sum, ch) => sum + countWords(ch), 0);
      return hookWords + chapterWords;
  }, [selectedJob]);


  // --- CORE LOGIC: JOB MANAGEMENT ---

  const updateJob = useCallback((jobId: string, updates: Partial<ScriptJob>) => {
    const newJobs = jobsRef.current.map(job =>
      job.id === jobId ? { ...job, ...updates } : job
    );
    // ** THE FIX **: Update ref synchronously before setting state
    jobsRef.current = newJobs;
    setJobs(newJobs);
  }, []);

  const resetForm = () => {
    setTitle('');
    setConcept('');
    setDuration('10');
    setFormError('');
  }
  
  const handleCreateNewScript = () => {
    resetForm();
    setSelectedJobId(null);
    setGenerationStatus(GenerationStatus.IDLE);
    generationStatusRef.current = GenerationStatus.IDLE;
    setIsFormCollapsed(false);
    setView('WORKSPACE');
  };

  const handleManualOneClickGenerate = async () => {
    if (!title.trim() || !concept.trim() || !duration) {
      setFormError('All fields are required.');
      return;
    }
    if (apiKeys.length === 0) {
      setFormError('Please add at least one Gemini API key in the settings.');
      return;
    }
    
    setFormError('');
    setIsFormCollapsed(true);

    const newJob: ScriptJob = {
      id: createUniqueId(),
      source: 'MANUAL',
      title: title.trim(),
      concept: concept.trim(),
      duration: parseInt(duration, 10),
      status: 'WRITING',
      createdAt: Date.now(),
      rawOutlineText: '',
      refinedTitle: title.trim(), // Set refinedTitle to original title
      outlines: [],
      hook: '',
      chaptersContent: [],
      currentTask: 'Starting...',
      libraryStatus: 'AVAILABLE',
    };

    // ** THE FIX **: Update ref synchronously before setting state
    const newJobsList = [...jobsRef.current, newJob];
    jobsRef.current = newJobsList;
    setJobs(newJobsList);
    setSelectedJobId(newJob.id);
    
    runFullGeneration(newJob.id);
  };
  
  const handleResumeGeneration = async (jobId: string) => {
    const jobToResume = jobsRef.current.find(j => j.id === jobId);
    if (!jobToResume) {
      console.error("Could not find job to resume");
      return;
    }
    setSelectedJobId(jobId);
    runFullGeneration(jobId);
  };

  const handleGeneratePostGenerationAssets = useCallback(async (jobIdToProcess?: string, openModalOnSuccess = false) => {
    const job = jobsRef.current.find(j => j.id === (jobIdToProcess || selectedJobId));
    if (!job || !job.hook) return;

    setIsPostGenAssetsLoading(true);
    try {
        const fullScript = `${job.hook}\n\n${job.chaptersContent.join('\n\n')}`;
        const { thumbnailIdeas, titleDescriptionPackages } = await generatePostGenerationAssets(job.title, fullScript);
        
        updateJob(job.id, { thumbnailIdeas, titleDescriptionPackages });
        if (openModalOnSuccess) {
            setIsTitleDescModalOpen(true);
        }
    } catch (e) {
        console.error('Post-generation asset creation failed:', e);
        alert('Failed to generate titles, descriptions, and thumbnail ideas.');
    } finally {
        setIsPostGenAssetsLoading(false);
    }
  }, [selectedJobId, updateJob]);

  const runFullGeneration = async (jobId: string) => {
    setGenerationStatus(GenerationStatus.RUNNING);
    generationStatusRef.current = GenerationStatus.RUNNING;
    
    const getCurrentJobState = () => jobsRef.current.find(j => j.id === jobId);

    try {
        let initialJobState = getCurrentJobState();
        if (!initialJobState) throw new Error("Job not found.");

        updateJob(jobId, { status: 'WRITING', error: undefined, currentTask: 'Starting...' });

        const checkPause = async () => {
            while (generationStatusRef.current === GenerationStatus.PAUSED) {
                updateJob(jobId, { status: 'PAUSED', currentTask: 'Paused' });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (generationStatusRef.current === GenerationStatus.IDLE) throw new Error("STOPPED");
            updateJob(jobId, { status: 'WRITING' });
        };
        
        let currentJobState = getCurrentJobState();
        if (!currentJobState) throw new Error("Job not found.");
        const { title, concept, duration } = currentJobState;
        
        // Step 1: Generate Outlines (if needed)
        if (!currentJobState.rawOutlineText) {
          setCurrentTask('Generating outlines...');
          updateJob(jobId, { currentTask: 'Generating outlines...' });
          const rawOutlineText = await generateOutlines(title, concept, duration);
          const { outlines } = parseOutlines(rawOutlineText);
          updateJob(jobId, { rawOutlineText, refinedTitle: title, outlines });
        }
        
        currentJobState = getCurrentJobState();
        if (!currentJobState) throw new Error("Job not found.");
        const { rawOutlineText, outlines } = currentJobState;

        const totalWordsToGenerate = outlines.reduce((sum, ch) => sum + ch.wordCount, 0) + 150;
        const alreadyWrittenWords = countWords(currentJobState.hook || '') + currentJobState.chaptersContent.reduce((sum, ch) => sum + countWords(ch), 0);
        setProgress({ wordsWritten: alreadyWrittenWords, totalWords: totalWordsToGenerate });
        
        await checkPause();
        
        // Step 2: Generate Hook (if needed)
        if (!currentJobState.hook) {
          setCurrentTask('Generating hook...');
          updateJob(jobId, { currentTask: 'Generating hook...' });
          const hook = await generateHook(rawOutlineText);
          setProgress(p => ({ ...p, wordsWritten: p.wordsWritten + countWords(hook) }));
          updateJob(jobId, { hook });
        }

        await checkPause();
        currentJobState = getCurrentJobState();
        if (!currentJobState) throw new Error("Job not found.");

        // Step 3: Generate Chapters
        const chaptersAlreadyWrittenCount = currentJobState.chaptersContent.length;
        const allChaptersFromOutline = outlines.filter(o => o.id > 0);
        const chaptersToWrite = allChaptersFromOutline.slice(chaptersAlreadyWrittenCount);

        if (chaptersToWrite.length > 0) {
            const chapterBatches: ChapterOutline[][] = [];
            for (let i = 0; i < chaptersToWrite.length; i += 3) {
                chapterBatches.push(chaptersToWrite.slice(i, i + 3));
            }

            let tempChapterContent: string[] = [...currentJobState.chaptersContent];
            for (const batch of chapterBatches) {
                await checkPause();
                const chapterIds = batch.map(c => c.id).join(', ');
                const task = `Writing chapters: ${chapterIds}`;
                setCurrentTask(task);
                updateJob(jobId, { currentTask: task });

                const generatedContents = await generateChapterBatch(rawOutlineText, batch);
                tempChapterContent = [...tempChapterContent, ...generatedContents];

                const wordsInBatch = generatedContents.reduce((sum, c) => sum + countWords(c), 0);
                setProgress(p => ({ ...p, wordsWritten: p.wordsWritten + wordsInBatch }));

                updateJob(jobId, { chaptersContent: [...tempChapterContent]});
            }
        }
        
        currentJobState = getCurrentJobState();
        if (!currentJobState) throw new Error("Job not found.");
        if (currentJobState.chaptersContent.length < allChaptersFromOutline.length) {
            throw new Error("Generation finished but not all chapters were written. Please resume again.");
        }

        updateJob(jobId, { status: 'DONE', currentTask: 'Completed!' });
        setGenerationStatus(GenerationStatus.DONE);
        generationStatusRef.current = GenerationStatus.DONE;
        
        // Automatically generate titles & descriptions on completion and open the modal
        handleGeneratePostGenerationAssets(jobId, true);

    } catch (error: any) {
        console.error("Script generation failed:", error);
        const errorMessage = error.message === "STOPPED" ? "Generation stopped by user." : error.message;
        updateJob(jobId, { status: 'FAILED', error: errorMessage, currentTask: 'Failed' });
        setGenerationStatus(GenerationStatus.IDLE);
        generationStatusRef.current = GenerationStatus.IDLE;
    }
  };

  const handlePause = () => {
    setGenerationStatus(GenerationStatus.PAUSED);
    generationStatusRef.current = GenerationStatus.PAUSED;
  };
  const handleResume = () => {
    setGenerationStatus(GenerationStatus.RUNNING);
    generationStatusRef.current = GenerationStatus.RUNNING;
  };
  const handleStop = () => {
    setGenerationStatus(GenerationStatus.IDLE);
    generationStatusRef.current = GenerationStatus.IDLE;
  };
  
  const handleSignOut = async () => {
    // FIX: Use the v8/compat `auth.signOut()` method.
    await auth.signOut();
  };
  
  // --- LIBRARY HANDLERS ---
  const handleArchiveJob = useCallback((jobId: string) => {
    updateJob(jobId, { libraryStatus: 'ARCHIVED', userStatus: undefined });
  }, [updateJob]);

  const handleRestoreJob = useCallback((jobId: string) => {
    updateJob(jobId, { libraryStatus: 'AVAILABLE' });
  }, [updateJob]);

  const handleDeleteJob = useCallback((jobId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this archived script? This action cannot be undone.')) {
        const newJobs = jobsRef.current.filter(job => job.id !== jobId);
        jobsRef.current = newJobs;
        setJobs(newJobs);
    }
  }, []);

  const handleToggleUserStatus = useCallback((jobId: string) => {
    const targetJob = jobsRef.current.find(j => j.id === jobId);
    if (!targetJob) return;

    const isCurrentlyWorking = targetJob.userStatus === 'WORKING';

    // FIX: Explicitly define the return type of the map function as ScriptJob
    // to help TypeScript correctly infer the type of `newJobs` and avoid assignment errors.
    const newJobs = jobsRef.current.map((job): ScriptJob => {
      // For the job that was clicked
      if (job.id === jobId) {
        // If it was the 'WORKING' job, clear its status. Otherwise, set it to 'WORKING'.
        return { ...job, userStatus: isCurrentlyWorking ? undefined : 'WORKING' };
      }
      // If we are setting a NEW job to 'WORKING', we must clear the status from the old one.
      if (!isCurrentlyWorking && job.userStatus === 'WORKING') {
        return { ...job, userStatus: undefined };
      }
      return job;
    });

    jobsRef.current = newJobs;
    setJobs(newJobs);
  }, []);

  // --- POST-GENERATION HANDLERS ---
  const handleSplitScript = () => {
    const job = selectedJob;
    if (!job) return;
  
    // Pre-populate splitter text if it's the first time
    if (!job.splitterText && job.chaptersContent.length > 1) {
      const textToSplit = job.chaptersContent.slice(1).join('\n\n');
      updateJob(job.id, { splitterText: textToSplit });
    }
    
    setView('SPLITTER');
  };

  const handleOpenThumbnailModal = () => {
    if (!selectedJob?.thumbnailIdeas) {
      handleGeneratePostGenerationAssets();
    }
    setIsThumbnailModalOpen(true);
  };
  
  const handleGenerateThumbnailImage = useCallback(async (config: any) => {
      if (!selectedJob) return;
      setIsLoadingThumbnailImage(true);
      try {
          const newImageUrl = await generateThumbnailImage(config.prompt, config.text, config.addText, config.model, config.baseImage);
          const existingUrls = selectedJob.thumbnailImageUrls || [];
          updateJob(selectedJob.id, { thumbnailImageUrls: [...existingUrls, newImageUrl] });
      } catch (e: any) {
          console.error(e);
          alert(`Failed to generate image: ${e.message}`);
      } finally {
          setIsLoadingThumbnailImage(false);
      }
  }, [selectedJob, updateJob]);

  const handleUploadThumbnailImage = useCallback((dataUrl: string) => {
    if (!selectedJob) return;
    const existingUrls = selectedJob.thumbnailImageUrls || [];
    updateJob(selectedJob.id, { thumbnailImageUrls: [...existingUrls, dataUrl] });
  }, [selectedJob, updateJob]);
  
  const handleOpenTitlesModal = () => {
    if (!selectedJob?.titleDescriptionPackages || selectedJob.titleDescriptionPackages.length === 0) {
      handleGeneratePostGenerationAssets(selectedJob?.id, true);
    } else {
      setIsTitleDescModalOpen(true);
    }
  };


  // --- RENDER LOGIC ---

  if (isLoadingAuth) {
    return <Loader message="Authenticating..." />;
  }

  if (!user) {
    return <PasswordProtection />;
  }

  const renderWorkspaceView = () => (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Form Panel */}
      <div className={`transition-all duration-300 ease-in-out bg-gray-900 border-r border-gray-800 flex flex-col ${isFormCollapsed ? 'w-16' : 'w-96'}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className={`text-xl font-bold text-indigo-400 transition-opacity ${isFormCollapsed ? 'opacity-0' : 'opacity-100'}`}>Script Generation</h2>
          <button onClick={() => setIsFormCollapsed(!isFormCollapsed)} className="text-gray-400 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFormCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} /></svg>
          </button>
        </div>
        <div className={`p-4 flex-1 overflow-y-auto custom-scrollbar transition-opacity ${isFormCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="space-y-4">
            <div>
              <label htmlFor="video-title" className="block text-sm font-medium text-gray-300">Video Title</label>
              <input type="text" id="video-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="story-concept" className="block text-sm font-medium text-gray-300">Story Concept</label>
              <textarea id="story-concept" value={concept} onChange={e => setConcept(e.target.value)} rows={5} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div>
              <label htmlFor="video-duration" className="block text-sm font-medium text-gray-300">Video Duration (minutes)</label>
              <input type="number" id="video-duration" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <Button onClick={handleManualOneClickGenerate} disabled={generationStatus === GenerationStatus.RUNNING} className="w-full">
              Generate Full Script
            </Button>
            <Button onClick={handleCreateNewScript} variant="secondary" className="w-full mt-2">
              Create New Script
            </Button>
            {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
             {selectedJob?.status === 'FAILED' && <p className="text-red-400 text-sm mt-2">Error: {selectedJob.error}</p>}
          </div>
        </div>
      </div>
      
      {/* Right: Consolidated Script View Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950/70">
        {!selectedJob ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Welcome to the Script Generator</h2>
              <p className="text-gray-400 mt-2">Fill out the details on the left to generate your first script.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-xl font-semibold text-center mb-4 break-words" title={selectedJob.title}>
                    {selectedJob.title}
                </h3>
                <ManualProgressTracker 
                  outlines={selectedJob.outlines} 
                  currentTask={selectedJob.currentTask || ''} 
                  generationStatus={generationStatus} 
                  hookGenerated={!!selectedJob.hook} 
                  chaptersGeneratedCount={selectedJob.chaptersContent.length}
                />
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar prose prose-invert prose-lg max-w-none prose-p:text-gray-300 whitespace-pre-wrap">
                {/* Outline Viewer */}
                {selectedJob.outlines.length > 0 && (
                  <div className="not-prose mb-8">
                    <details className="bg-gray-800/50 rounded-lg border border-gray-700">
                        <summary className="p-3 cursor-pointer font-semibold text-indigo-300 hover:bg-gray-800/80 rounded-t-lg">View Script Outline</summary>
                        <div className="p-4 border-t border-gray-700">
                            <ul className="space-y-3 list-disc list-inside text-gray-300">
                                {selectedJob.outlines.map(outline => (
                                    <li key={outline.id}>
                                        <strong className="text-gray-100">Chapter {outline.id}: {outline.title}</strong> ({outline.wordCount} words)
                                        <p className="text-sm text-gray-400 pl-6">{outline.concept}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </details>
                  </div>
                )}
                
                {/* Hook Section */}
                {selectedJob.hook && (
                    <section className="mb-10 pb-6 border-b border-gray-800" id="hook">
                        <h2 className="text-3xl font-bold text-indigo-300 !mb-1">The Hook</h2>
                        <p className="text-sm text-gray-400 !mt-0 !mb-4">
                            {countWords(selectedJob.hook)} / ~150 words
                        </p>
                        <p>{selectedJob.hook}</p>
                    </section>
                )}

                {/* Chapters Section */}
                {selectedJob.outlines
                  .filter(o => o.id > 0)
                  .map((chapter, index) => {
                    const content = selectedJob.chaptersContent[index];
                    const isBeingWritten = generationStatus === GenerationStatus.RUNNING && index === selectedJob.chaptersContent.length && !!selectedJob.hook;
                    
                    if (content || isBeingWritten) {
                      return (
                        <section key={chapter.id} className="mb-10 pb-6 border-b border-gray-800 last:border-b-0" id={`chapter-${chapter.id}`}>
                          <h2 className="text-3xl font-bold text-indigo-300 !mb-1">Chapter {chapter.id}: {chapter.title}</h2>
                          <p className="text-sm text-gray-400 !mt-0 !mb-4">
                              {content ? countWords(content) : 0} / {chapter.wordCount} words
                          </p>
                          {content && <p>{content}</p>}
                          {isBeingWritten && <div className="mt-4"><InlineLoader message={currentTask} /></div>}
                        </section>
                      );
                    }
                    return null;
                })}
                
                {generationStatus === GenerationStatus.RUNNING && !selectedJob.hook && (
                  <InlineLoader message={currentTask} />
                )}
            </div>
            
            {selectedJob.status === 'DONE' && (
              <div className="p-4 border-t border-gray-800 bg-gray-900">
                  <CopyControls 
                    job={selectedJob} 
                    totalWords={totalWords}
                    onSplitScript={handleSplitScript}
                  />
                    <div className="flex gap-4 mt-4">
                      <Button onClick={handleOpenThumbnailModal} disabled={isPostGenAssetsLoading}>
                        {isPostGenAssetsLoading ? 'Generating Assets...' : 'Thumbnail Workshop'}
                      </Button>
                      <Button onClick={handleOpenTitlesModal} disabled={isPostGenAssetsLoading}>
                        {isPostGenAssetsLoading ? 'Generating Assets...' : 'Titles & Descriptions'}
                      </Button>
                  </div>
              </div>
            )}

            {selectedJob.status === 'FAILED' && (
              <div className="p-4 border-t border-gray-800 bg-gray-900">
                  <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-center">
                      <p className="font-bold">Generation Failed</p>
                      <p className="text-sm">{selectedJob.error}</p>
                  </div>
                  <div className="flex items-center justify-center">
                      <Button onClick={() => handleResumeGeneration(selectedJob.id!)} variant="primary" className="w-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Resume Generation
                      </Button>
                  </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderLibraryView = () => (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-400">Script Library</h1>
             <div className="bg-gray-800 p-1 rounded-lg flex items-center gap-1 border border-gray-700">
                <button onClick={() => setLibraryFilter('AVAILABLE')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${libraryFilter === 'AVAILABLE' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'}`}>Available</button>
                <button onClick={() => setLibraryFilter('ARCHIVED')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${libraryFilter === 'ARCHIVED' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'}`}>Archived</button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs
                .filter(job => job.libraryStatus === libraryFilter)
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(job => (
                <div 
                    key={job.id} 
                    className={`bg-gray-800 rounded-lg p-5 flex flex-col justify-between border-2 transition-all duration-300 ${job.userStatus === 'WORKING' ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-gray-700 hover:border-indigo-600'}`}
                >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-200 truncate pr-2 flex-1" title={job.title}>{job.title}</h3>
                             <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {job.userStatus === 'WORKING' && (
                                    <div className="text-xs font-bold px-2 py-1 rounded-full bg-cyan-500 text-white animate-pulse">
                                        WORKING ON
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full text-center"
                                    style={{
                                        'WRITING': {backgroundColor: '#3b82f6', color: '#fff'},
                                        'PAUSED': {backgroundColor: '#f97316', color: '#fff'},
                                        'DONE': {backgroundColor: '#22c55e', color: '#fff'},
                                        'FAILED': {backgroundColor: '#ef4444', color: '#fff'}
                                    }[job.status]}>
                                    {job.status}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">Created: {new Date(job.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
                        <Button onClick={() => { setSelectedJobId(job.id); setView('WORKSPACE'); }} className="w-full">
                            View Script
                        </Button>
                         {libraryFilter === 'AVAILABLE' ? (
                            <>
                                <Button onClick={() => handleToggleUserStatus(job.id)} variant="secondary" className={`w-full ${job.userStatus === 'WORKING' ? 'ring-2 ring-cyan-500' : ''}`}>
                                  {job.userStatus === 'WORKING' ? 'Clear Status' : 'Mark as Working'}
                                </Button>
                                <Button onClick={() => handleArchiveJob(job.id)} variant="secondary" className="w-full">Archive</Button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={() => handleRestoreJob(job.id)} variant="secondary" className="w-full">Restore</Button>
                                <Button onClick={() => handleDeleteJob(job.id)} variant="secondary" className="w-full bg-red-800/50 hover:bg-red-700/50 border-red-700 hover:border-red-600 focus:ring-red-600 text-red-200 hover:text-white">Delete</Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-200">
      <ApiKeyManager isOpen={isApiKeyManagerOpen} onClose={() => setIsApiKeyManagerOpen(false)} apiKeys={apiKeys} setApiKeys={setApiKeys} />
      <GenerationControls status={generationStatus} onPause={handlePause} onResume={handleResume} onStop={handleStop} currentTask={currentTask} progress={progress}/>
      {selectedJob && (
        <ThumbnailIdeasModal 
          isOpen={isThumbnailModalOpen}
          onClose={() => setIsThumbnailModalOpen(false)}
          ideas={selectedJob.thumbnailIdeas || null}
          isLoadingIdeas={isPostGenAssetsLoading}
          isLoadingImage={isLoadingThumbnailImage}
          onReanalyze={() => handleGeneratePostGenerationAssets()}
          onGenerateImage={handleGenerateThumbnailImage}
          onUploadImage={handleUploadThumbnailImage}
          thumbnailImageUrls={selectedJob.thumbnailImageUrls || null}
        />
      )}
      {selectedJob && (
        <TitleDescriptionManager
            isOpen={isTitleDescModalOpen}
            onClose={() => setIsTitleDescModalOpen(false)}
            packages={selectedJob.titleDescriptionPackages || []}
            onUpdatePackages={(updatedPackages) => {
                updateJob(selectedJob!.id, { titleDescriptionPackages: updatedPackages });
            }}
            onRegenerate={() => handleGeneratePostGenerationAssets(selectedJob?.id, true)}
            isLoading={isPostGenAssetsLoading}
        />
      )}

      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 shadow-md">
        <div onClick={handleCreateNewScript} className="flex items-center gap-4 cursor-pointer group">
          <svg className="h-8 w-8 text-indigo-500 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M19.95 2.55a2 2 0 0 0-2.83 0L3.55 16.12a2 2 0 0 0 0 2.83l1.42 1.42a2 2 0 0 0 2.83 0L21.37 6.8a2 2 0 0 0 0-2.83L19.95 2.55zM5.68 18.24l-1.42-1.42a.5.5 0 0 1 0-.71l13.57-13.57a.5.5 0 0 1 .71 0l1.42 1.42a.5.5 0 0 1 0 .71L6.38 18.24a.5.5 0 0 1-.7 0z" /><path d="M2.12 15.41a2 2 0 0 0 0 2.83l2.83 2.83a2 2 0 0 0 2.83 0l2.83-2.83a2 2 0 0 0 0-2.83L7.78 12.6a2 2 0 0 0-2.83 0L2.12 15.41zm3.54 4.24L4.24 18.24l2.83-2.83 1.41 1.41-2.83 2.83z" /></svg>
          <h1 className="text-xl font-bold group-hover:text-gray-100 transition-colors">Long Form Script Generator</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
            <div className="bg-gray-800 p-1 rounded-lg flex items-center gap-1 border border-gray-700">
                <Button variant={view === 'WORKSPACE' ? 'primary' : 'secondary'} onClick={() => setView('WORKSPACE')} className="!px-6 !py-1.5">Workspace</Button>
                <Button variant={view === 'LIBRARY' ? 'primary' : 'secondary'} onClick={() => setView('LIBRARY')} className="!px-6 !py-1.5">Library</Button>
            </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <button onClick={handleSignOut} className="text-xs text-indigo-400 hover:text-indigo-300">Sign Out</button>
          </div>
          <button onClick={() => setIsApiKeyManagerOpen(true)} className="p-2 rounded-md hover:bg-gray-700 transition-colors" aria-label="Open API Key Manager">
            <GearIcon />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {view === 'WORKSPACE' && renderWorkspaceView()}
        {view === 'LIBRARY' && renderLibraryView()}
        {view === 'SPLITTER' && selectedJob && (
          <ScriptSplitter
            job={selectedJob}
            onUpdateJob={(jobId, updates) => updateJob(jobId, updates)}
            onBack={() => setView('WORKSPACE')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
