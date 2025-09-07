import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ScriptJob, SplitSection } from '../types';

interface ScriptSplitterProps {
  job: ScriptJob;
  onUpdateJob: (jobId: string, updates: Partial<ScriptJob>) => void;
  onBack: () => void;
}

// The splitting logic
const splitTextIntelligently = (text: string, maxLength: number): string[] => {
  if (!text) return [];
  const sections: string[] = [];
  let remainingText = text.trim();

  while (remainingText.length > 0) {
    if (remainingText.length <= maxLength) {
      sections.push(remainingText);
      break;
    }

    let chunk = remainingText.substring(0, maxLength);
    let splitIndex = -1;

    // Find the last sentence end in the chunk
    const sentenceEndings = ['.', '!', '?'];
    for (let i = chunk.length - 1; i >= 0; i--) {
      if (sentenceEndings.includes(chunk[i])) {
        // Ensure it's followed by a space or newline to be a true sentence end
        if (i + 1 < chunk.length && (chunk[i + 1] === ' ' || chunk[i + 1] === '\n')) {
          splitIndex = i + 2; // Split after the punctuation and space
          break;
        }
      }
    }
    
    // If no sentence end found, find the last space to not break a word
    if (splitIndex === -1) {
        splitIndex = chunk.lastIndexOf(' ');
    }

    // If no space found (one very long word), just split at maxLength
    if (splitIndex === -1) {
        splitIndex = maxLength;
    }

    const finalChunk = remainingText.substring(0, splitIndex).trim();
    if (finalChunk) {
        sections.push(finalChunk);
    }
    remainingText = remainingText.substring(splitIndex).trim();
  }

  return sections;
};

const ScriptSplitter: React.FC<ScriptSplitterProps> = ({ job, onUpdateJob, onBack }) => {
  const [text, setText] = useState(job.splitterText || '');
  const [maxChars, setMaxChars] = useState(job.maxCharsPerSection || 10000);
  const [sections, setSections] = useState<SplitSection[]>(job.splitSections || []);
  const [keyword, setKeyword] = useState(''); // From screenshot, not used in logic yet.

  // Debounce updates to avoid hammering localStorage on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (text !== job.splitterText) {
        onUpdateJob(job.id, { splitterText: text });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [text, job.id, job.splitterText, onUpdateJob]);
  
  const handleSplit = () => {
    const newSplitSections = splitTextIntelligently(text, maxChars).map(content => ({
        content,
        copied: false,
    }));
    setSections(newSplitSections);
    onUpdateJob(job.id, { splitSections: newSplitSections, maxCharsPerSection: maxChars, splitterText: text });
  };
  
  const handleCopy = (index: number) => {
    const sectionToCopy = sections[index];
    navigator.clipboard.writeText(sectionToCopy.content).then(() => {
        const updatedSections = sections.map((sec, i) => i === index ? { ...sec, copied: true } : sec);
        setSections(updatedSections);
        onUpdateJob(job.id, { splitSections: updatedSections });
    }).catch(err => {
        console.error("Failed to copy text:", err);
        alert("Failed to copy text.");
    });
  };

  return (
    <div className="p-8 flex flex-col h-full bg-gray-950 text-gray-200">
        <div className="flex items-center justify-between mb-4">
            <Button onClick={onBack} variant="secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Workspace
            </Button>
            <h1 className="text-3xl font-bold text-indigo-400">Script Splitter</h1>
            <div className="w-48"></div> {/* Spacer */}
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
            {/* Left Panel: Script and Controls */}
            <div className="lg:w-1/3 flex flex-col gap-4">
                <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Your Script</h2>
                    <p className="text-sm text-gray-400 mb-4">Edit the text below, then use the controls to split it into sections.</p>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full flex-1 bg-gray-800 border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none custom-scrollbar"
                        placeholder="Your script content (Chapter 2 onwards)..."
                    />
                </div>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-4">
                     <div>
                        <label htmlFor="search-keyword" className="block text-sm font-medium text-gray-400 mb-1">Search Keyword (Optional)</label>
                        <input 
                            type="text"
                            id="search-keyword"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500"
                            placeholder="e.g., introduction"
                        />
                    </div>
                    <div>
                        <label htmlFor="max-chars" className="block text-sm font-medium text-gray-400 mb-1">Max Characters per Section</label>
                        <input 
                            type="number"
                            id="max-chars"
                            value={maxChars}
                            onChange={e => setMaxChars(parseInt(e.target.value, 10) || 10000)}
                            className="w-full bg-gray-800 border-gray-700 rounded-md p-2 focus:ring-indigo-500"
                        />
                    </div>
                    <Button onClick={handleSplit} className="w-full">Split Script</Button>
                </div>
            </div>

            {/* Right Panel: Split Sections */}
            <div className="lg:w-2/3 flex flex-col bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Split Sections ({sections.length})</h2>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {sections.length > 0 ? (
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {sections.map((section, index) => (
                                <div key={index} className={`bg-gray-800 rounded-lg p-3 border-2 ${section.copied ? 'border-green-500' : 'border-gray-700'} flex flex-col gap-2`}>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-200">Section {index + 1}</h3>
                                        <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">{section.content.length} chars</span>
                                    </div>
                                    <textarea
                                        readOnly
                                        value={section.content}
                                        className="w-full flex-1 bg-gray-900 border-gray-700 rounded-md p-2 text-sm custom-scrollbar resize-none"
                                        rows={6}
                                    />
                                    <Button onClick={() => handleCopy(index)} variant="secondary" className="w-full">
                                        {section.copied ? 'Copied' : 'Copy Section'}
                                    </Button>
                                </div>
                            ))}
                         </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Split sections will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ScriptSplitter;
