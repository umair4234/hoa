

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

import { 
  generateOutlines, 
  generateHook, 
  generateChapterBatch,
  generateThumbnailIdeas,
  generateTitlesAndDescriptions,
  generateThumbnailImage
} from './services/geminiService';
import { auth } from './services/firebase';
import * as firebaseAuth from "firebase/auth";

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
const parseOutlines = (rawText: string): { refinedTitle: string; outlines: ChapterOutline[] } => {
    const text = rawText.replace(/^---/, '').trim();
    let refinedTitle = '';
    const outlines: ChapterOutline[] = [];

    const titleMatch = text.match(/^Title:\s*(.*)/);
    if (titleMatch) {
        refinedTitle = titleMatch[1].trim();
    } else {
        console.error("Could not find 'Title:' in raw text:", `"${rawText}"`);
    }

    // Split by "Chapter X:" but keep the delimiter in the next block. It's easier to find the title.
    const chapterBlocks = text.split(/\n(?=Chapter \d+:)/);

    // Slice(1) to skip the initial block which contains the title and "Chapter 0" (hook placeholder)
    chapterBlocks.slice(1).forEach((block) => {
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

    return { refinedTitle, outlines };
};


const App: React.FC = () => {
  // --- AUTH & CONFIG ---
  const [user, setUser] = useState<firebaseAuth.User | null>(null);
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
  const [isLoadingThumbnailIdeas, setIsLoadingThumbnailIdeas] = useState(false);
  const [isLoadingThumbnailImage, setIsLoadingThumbnailImage] = useState(false);
  const [isTitleDescLoading, setIsTitleDescLoading] = useState(false);

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
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
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
      refinedTitle: '',
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
  
  const runFullGeneration = async (jobId: string) => {
    setGenerationStatus(GenerationStatus.RUNNING);
    generationStatusRef.current = GenerationStatus.RUNNING;
    
    // Helper to find the current job state from the ref
    const getCurrentJobState = () => jobsRef.current.find(j => j.id === jobId);

    try {
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
        
        // Step 1: Generate Outlines
        setCurrentTask('Generating outlines...');
        updateJob(jobId, { currentTask: 'Generating outlines...' });
        const rawOutlineText = await generateOutlines(title, concept, duration);
        const { refinedTitle, outlines } = parseOutlines(rawOutlineText);
        const totalWordsToGenerate = outlines.reduce((sum, ch) => sum + ch.wordCount, 0) + 150;
        setProgress({ wordsWritten: 0, totalWords: totalWordsToGenerate });
        updateJob(jobId, { rawOutlineText, refinedTitle, outlines });
        
        await checkPause();
        
        // Step 2: Generate Hook
        setCurrentTask('Generating hook...');
        updateJob(jobId, { currentTask: 'Generating hook...' });
        const hook = await generateHook(rawOutlineText);
        setProgress(p => ({ ...p, wordsWritten: p.wordsWritten + 150 }));
        updateJob(jobId, { hook });

        await checkPause();

        // Step 3: Generate Chapters in batches
        const chapterBatches: ChapterOutline[][] = [];
        const chaptersToWrite = outlines.filter(o => o.id > 0);
        for (let i = 0; i < chaptersToWrite.length; i += 3) {
            chapterBatches.push(chaptersToWrite.slice(i, i + 3));
        }

        let tempChapterContent: string[] = [];
        for (const batch of chapterBatches) {
            await checkPause();
            const chapterIds = batch.map(c => c.id).join(', ');
            const task = `Writing chapters: ${chapterIds}`;
            setCurrentTask(task);
            updateJob(jobId, { currentTask: task });

            const generatedContents = await generateChapterBatch(rawOutlineText, batch);
            tempChapterContent = [...tempChapterContent, ...generatedContents];

            const wordsInBatch = batch.reduce((sum, ch) => sum + ch.wordCount, 0);
            setProgress(p => ({ ...p, wordsWritten: p.wordsWritten + wordsInBatch }));

            updateJob(jobId, { chaptersContent: [...tempChapterContent]});
        }
        
        updateJob(jobId, { status: 'DONE', currentTask: 'Completed!' });
        setGenerationStatus(GenerationStatus.DONE);
        generationStatusRef.current = GenerationStatus.DONE;

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
    await firebaseAuth.signOut(auth);
  };
  
  // --- LIBRARY HANDLERS ---
  const handleArchiveJob = useCallback((jobId: string) => {
    updateJob(jobId, { libraryStatus: 'ARCHIVED' });
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

  // --- POST-GENERATION HANDLERS ---
  const handleGenerateThumbnailIdeas = useCallback(async () => {
    if (!selectedJob || !selectedJob.hook) return;
    setIsLoadingThumbnailIdeas(true);
    try {
      const ideas = await generateThumbnailIdeas(selectedJob.refinedTitle, selectedJob.hook);
      updateJob(selectedJob.id, { thumbnailIdeas: ideas });
    } catch(e) {
      console.error(e);
      alert("Failed to generate thumbnail ideas.");
    } finally {
      setIsLoadingThumbnailIdeas(false);
    }
  }, [selectedJob, updateJob]);

  const handleOpenThumbnailModal = () => {
    if (!selectedJob?.thumbnailIdeas) {
      handleGenerateThumbnailIdeas();
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
  
  const handleGenerateTitles = useCallback(async () => {
    if (!selectedJob || !selectedJob.hook) return;
    setIsTitleDescLoading(true);
    try {
      const fullScript = `${selectedJob.hook}\n\n${selectedJob.chaptersContent.join('\n\n')}`;
      const packages = await generateTitlesAndDescriptions(selectedJob.title, fullScript);
      updateJob(selectedJob.id, { titleDescriptionPackages: packages });
    } catch (e) {
      console.error(e);
      alert('Failed to generate titles and descriptions.');
    } finally {
      setIsTitleDescLoading(false);
    }
  }, [selectedJob, updateJob]);


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
                <h3 className="text-xl font-semibold text-center mb-4 break-words" title={selectedJob.refinedTitle || selectedJob.title}>
                    {selectedJob.refinedTitle || selectedJob.title}
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
                    <CopyControls job={selectedJob} totalWords={totalWords} />
                     <div className="flex gap-4 mt-4">
                        <Button onClick={handleOpenThumbnailModal}>Thumbnail Workshop</Button>
                        <Button onClick={handleGenerateTitles} disabled={isTitleDescLoading}>
                            {isTitleDescLoading ? 'Generating...' : 'Generate Titles & Descriptions'}
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
            {jobs.filter(job => job.libraryStatus === libraryFilter).map(job => (
                <div key={job.id} className="bg-gray-800 rounded-lg p-5 flex flex-col justify-between border border-gray-700 hover:border-indigo-600 transition-colors">
                    <div>
                        <h3 className="font-bold text-lg text-gray-200 truncate mb-2">{job.refinedTitle || job.title}</h3>
                        <p className="text-xs text-gray-400 mb-4">Created: {new Date(job.createdAt).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-full text-center w-fit"
                            style={{
                                'WRITING': {backgroundColor: '#3b82f6', color: '#fff'},
                                'PAUSED': {backgroundColor: '#f97316', color: '#fff'},
                                'DONE': {backgroundColor: '#22c55e', color: '#fff'},
                                'FAILED': {backgroundColor: '#ef4444', color: '#fff'}
                            }[job.status]}>
                            {job.status}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
                        <Button onClick={() => { setSelectedJobId(job.id); setView('WORKSPACE'); }} className="w-full">
                            View Script
                        </Button>
                         {libraryFilter === 'AVAILABLE' ? (
                            <Button onClick={() => handleArchiveJob(job.id)} variant="secondary" className="w-full">Archive</Button>
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
          isLoadingIdeas={isLoadingThumbnailIdeas}
          isLoadingImage={isLoadingThumbnailImage}
          onReanalyze={handleGenerateThumbnailIdeas}
          onGenerateImage={handleGenerateThumbnailImage}
          thumbnailImageUrls={selectedJob.thumbnailImageUrls || null}
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
        {view === 'WORKSPACE' ? renderWorkspaceView() : renderLibraryView()}
      </main>
    </div>
  );
};

export default App;