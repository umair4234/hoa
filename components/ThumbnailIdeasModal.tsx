import React, { useState } from 'react';
import Button from './Button';
import { GeneratedThumbnailIdea } from '../types';
import InlineLoader from './InlineLoader';

interface ThumbnailIdeasViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: GeneratedThumbnailIdea[] | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

const ThumbnailIdeasViewerModal: React.FC<ThumbnailIdeasViewerModalProps> = ({
  isOpen,
  onClose,
  ideas,
  isLoading,
  onRegenerate,
}) => {
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptIndex(index);
      setTimeout(() => setCopiedPromptIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="thumbnailIdeasViewerTitle"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-6xl relative text-gray-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="thumbnailIdeasViewerTitle" className="text-2xl font-bold text-indigo-400 mb-4">Thumbnail Ideas</h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <InlineLoader message="Generating creative thumbnail concepts..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {ideas?.map((idea, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col gap-4">
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
                    <textarea
                      readOnly
                      value={idea.imageGenerationPrompt}
                      className="w-full flex-1 bg-gray-800 border-gray-700 rounded-md p-2 text-xs custom-scrollbar resize-none font-mono"
                      rows={8}
                    />
                  </div>
                   <Button onClick={() => handleCopy(idea.imageGenerationPrompt, index)} variant="secondary" className="mt-auto">
                    {copiedPromptIndex === index ? 'Copied!' : 'Copy Prompt'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-between items-center gap-4">
          <Button onClick={onRegenerate} variant="secondary" disabled={isLoading}>
            Regenerate Ideas
          </Button>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailIdeasViewerModal;
