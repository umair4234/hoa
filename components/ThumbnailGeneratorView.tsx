import React, { useState } from 'react';
import Button from './Button';
import InlineLoader from './InlineLoader';
import { GeneratedThumbnailIdea } from '../types';
import { generateThumbnailIdeas } from '../services/geminiService';

const ThumbnailGeneratorView: React.FC = () => {
    const [thumbTitle, setThumbTitle] = useState('');
    const [thumbHook, setThumbHook] = useState('');
    const [thumbIdeas, setThumbIdeas] = useState<GeneratedThumbnailIdea[] | null>(null);
    const [isThumbLoading, setIsThumbLoading] = useState(false);
    const [thumbError, setThumbError] = useState('');
    const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!thumbTitle.trim() || !thumbHook.trim()) {
            setThumbError('Title and Hook are required to generate ideas.');
            return;
        }
        setThumbError('');
        setIsThumbLoading(true);
        setThumbIdeas(null);
        try {
            const result = await generateThumbnailIdeas(thumbTitle, thumbHook);
            setThumbIdeas(result);
        } catch (e: any) {
            const errorMessage = e.message || 'An unknown error occurred while generating ideas.';
            setThumbError(errorMessage);
            console.error('Thumbnail generation failed:', e);
        } finally {
            setIsThumbLoading(false);
        }
    };
    
    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedPromptIndex(index);
          setTimeout(() => setCopiedPromptIndex(null), 2000);
        }).catch(err => {
          console.error('Failed to copy text:', err);
        });
    };

    return (
      <div className="p-8 flex flex-col h-full overflow-hidden">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">Thumbnail Idea Generator</h1>
        <p className="text-gray-400 mb-6">Enter a video title and hook to generate thumbnail concepts based on the custom style guide.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-4">
                 <div>
                    <label htmlFor="thumb-title" className="block text-sm font-medium text-gray-300">Video Title</label>
                    <input 
                        type="text" 
                        id="thumb-title" 
                        value={thumbTitle} 
                        onChange={e => setThumbTitle(e.target.value)} 
                        className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="e.g., HOA President Messed With The Wrong Guy"
                    />
                </div>
                <div>
                    <label htmlFor="thumb-hook" className="block text-sm font-medium text-gray-300">Video Hook</label>
                    <textarea 
                        id="thumb-hook" 
                        value={thumbHook} 
                        onChange={e => setThumbHook(e.target.value)} 
                        rows={8} 
                        className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar"
                        placeholder="Paste the opening paragraph of your script here..."
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isThumbLoading} className="w-full">
                    {isThumbLoading ? 'Generating Ideas...' : 'Generate Thumbnail Ideas'}
                </Button>
                {thumbError && <p className="text-red-400 text-sm">{thumbError}</p>}
            </div>
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4 min-h-[50vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">Generated Ideas</h2>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isThumbLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <InlineLoader message="Generating creative thumbnail concepts..." />
                        </div>
                    ) : thumbIdeas ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {thumbIdeas.map((idea, index) => (
                                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col gap-3">
                                    <h3 className="text-lg font-bold text-indigo-300">Idea #{index + 1}</h3>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Concept Summary</h4>
                                        <p className="text-gray-300 text-sm">{idea.summary}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Text Overlay</h4>
                                        <p className="text-yellow-300 font-extrabold text-lg tracking-wide uppercase" style={{ WebkitTextStroke: '1px black', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                            "{idea.textOverlay}"
                                        </p>
                                    </div>
                                    <div className="flex-grow flex flex-col">
                                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Image Generation Prompt</h4>
                                        <textarea readOnly value={idea.imageGenerationPrompt} className="w-full flex-1 bg-gray-700 border-gray-600 rounded-md p-2 text-xs custom-scrollbar resize-none font-mono" rows={6} />
                                    </div>
                                    <Button onClick={() => handleCopy(idea.imageGenerationPrompt, index)} variant="secondary" className="mt-auto">
                                        {copiedPromptIndex === index ? 'Copied!' : 'Copy Prompt'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Your generated ideas will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
};

export default ThumbnailGeneratorView;
