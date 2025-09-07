import React, { useState } from 'react';
import Button from './Button';
import { TitleDescriptionPackage } from '../types';
import InlineLoader from './InlineLoader';

interface TitleDescriptionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  packages: TitleDescriptionPackage[];
  onUpdatePackages: (packages: TitleDescriptionPackage[]) => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const TitleDescriptionManager: React.FC<TitleDescriptionManagerProps> = ({ isOpen, onClose, packages, onUpdatePackages, onRegenerate, isLoading }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleCopy = (pkg: TitleDescriptionPackage) => {
        const hashtagsText = pkg.hashtags.join(' ');
        const textToCopy = `Title: ${pkg.title}\n\nDescription:\n${pkg.description}\n\nHashtags:\n${hashtagsText}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(pkg.id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error("Failed to copy:", err);
            alert("Failed to copy text.");
        });
    };

    const toggleStatus = (id: number) => {
        const updatedPackages: TitleDescriptionPackage[] = packages.map(pkg => {
            if (pkg.id === id) {
                const isNowUsed = pkg.status !== 'Used';
                return { 
                    ...pkg, 
                    status: isNowUsed ? 'Used' : 'Unused',
                    usedAt: isNowUsed ? Date.now() : undefined
                };
            }
            return pkg;
        });
        onUpdatePackages(updatedPackages);
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titleDescModalTitle"
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl relative text-gray-200 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="titleDescModalTitle" className="text-2xl font-bold text-indigo-400 mb-4">Generated Titles & Descriptions</h2>
                
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center">
                        <InlineLoader message="Generating fresh ideas..." />
                    </div>
                )}

                {!isLoading && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {packages.map(pkg => (
                                <div key={pkg.id} className={`bg-gray-900 rounded-lg p-4 border-2 flex flex-col gap-3 transition-all ${pkg.status === 'Used' ? 'border-green-500' : 'border-gray-700'}`}>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">Title</p>
                                        <p className="font-bold text-gray-100">{pkg.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">Description</p>
                                        <p className="text-gray-300 text-sm">{pkg.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 mb-1">Hashtags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {pkg.hashtags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-gray-700 text-indigo-300 px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-3 border-t border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`status-toggle-${pkg.id}`} className="text-sm text-gray-300 cursor-pointer">Mark as Used</label>
                                            <button
                                                id={`status-toggle-${pkg.id}`}
                                                onClick={() => toggleStatus(pkg.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pkg.status === 'Used' ? 'bg-green-600' : 'bg-gray-600'}`}
                                                aria-pressed={pkg.status === 'Used'}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pkg.status === 'Used' ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                        <Button onClick={() => handleCopy(pkg)} variant="secondary" className="!px-4 !py-1.5" disabled={copiedId === pkg.id}>
                                            {copiedId === pkg.id ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                    {pkg.usedAt && (
                                        <div className="text-right text-xs text-green-400 mt-1">
                                            Used on: {new Date(pkg.usedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-6 flex justify-between items-center gap-4">
                    <Button onClick={onRegenerate} variant="secondary" disabled={isLoading}>
                        Regenerate
                    </Button>
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
    );
};

export default TitleDescriptionManager;
