import React, { useState } from 'react';
import Button from './Button';
import { TitleDescriptionPackage } from '../types';

interface TitleDescriptionManagerProps {
  packages: TitleDescriptionPackage[];
  onUpdatePackages: (packages: TitleDescriptionPackage[]) => void;
}

const TitleDescriptionManager: React.FC<TitleDescriptionManagerProps> = ({ packages, onUpdatePackages }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = (pkg: TitleDescriptionPackage) => {
        const textToCopy = `Title: ${pkg.title}\n\nDescription:\n${pkg.description}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(pkg.id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error("Failed to copy:", err);
        });
    };

    const toggleStatus = (id: number) => {
        // FIX: Explicitly type 'updatedPackages' to TitleDescriptionPackage[] to fix a TypeScript type inference error where the 'status' property was being incorrectly widened to a generic string.
        const updatedPackages: TitleDescriptionPackage[] = packages.map(pkg => 
            pkg.id === id ? { ...pkg, status: pkg.status === 'Used' ? 'Unused' : 'Used' } : pkg
        );
        onUpdatePackages(updatedPackages);
    };

    return (
        <div className="my-6 border-t border-gray-800 pt-6">
            <h3 className="text-2xl font-bold text-indigo-300 mb-4">Generated Titles & Descriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map(pkg => (
                    <div key={pkg.id} className={`bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col gap-3 transition-all ${pkg.status === 'Used' ? 'opacity-60' : ''}`}>
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
                        <div className="mt-2 pt-3 border-t border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <label htmlFor={`status-toggle-${pkg.id}`} className="text-sm text-gray-300 cursor-pointer">Mark as Used</label>
                                <button
                                    id={`status-toggle-${pkg.id}`}
                                    onClick={() => toggleStatus(pkg.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pkg.status === 'Used' ? 'bg-indigo-600' : 'bg-gray-600'}`}
                                    aria-pressed={pkg.status === 'Used'}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pkg.status === 'Used' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <Button onClick={() => handleCopy(pkg)} variant="secondary" className="!px-4 !py-1.5" disabled={copiedId === pkg.id}>
                                {copiedId === pkg.id ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TitleDescriptionManager;