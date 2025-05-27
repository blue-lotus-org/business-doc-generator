
import React, { useState, useEffect } from 'react';
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_DISPLAY_NAMES } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';

interface DocumentDisplayProps {
  docType: DocumentType;
  content: string;
  isLoading: boolean;
  onEdit: () => void; // For AI refinement
  disabled: boolean;
  onSaveDirectEdit: (docType: DocumentType, newContent: string) => void;
  businessIdeaTitle: string; // For download filename
}

export const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ 
  docType, 
  content, 
  isLoading, 
  onEdit, 
  disabled,
  onSaveDirectEdit,
  businessIdeaTitle 
}) => {
  const [isDirectEditing, setIsDirectEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');

  useEffect(() => {
    // When content changes (e.g., after AI generation or refinement),
    // and not in direct edit mode, update editText to reflect new content.
    if (!isDirectEditing) {
      setEditText(content);
    }
  }, [content, isDirectEditing]);

  const handleDirectEdit = () => {
    setEditText(content); // Load current content into textarea
    setIsDirectEditing(true);
  };

  const handleSaveEdit = () => {
    onSaveDirectEdit(docType, editText);
    setIsDirectEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(content); // Revert to original content
    setIsDirectEditing(false);
  };

  const handleDownload = () => {
    const filenameSafeIdea = businessIdeaTitle.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${DOCUMENT_TYPE_DISPLAY_NAMES[docType].replace(/\s+/g, '_')}_${filenameSafeIdea || 'document'}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-slate-850 p-6 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold text-sky-400">{DOCUMENT_TYPE_DISPLAY_NAMES[docType]}</h2>
        <div className="flex gap-2 flex-wrap">
          {!isDirectEditing && (
            <>
              <button
                onClick={handleDirectEdit}
                disabled={isLoading || disabled}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Directly edit ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}`}
              >
                Direct Edit
              </button>
              <button
                onClick={onEdit} // AI Refinement Modal
                disabled={isLoading || disabled}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Refine ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]} with AI`}
              >
                Refine with AI
              </button>
            </>
          )}
           <button
            onClick={handleDownload}
            disabled={isLoading || disabled || isDirectEditing}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Download ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}`}
          >
            Download
          </button>
        </div>
      </div>

      {isDirectEditing && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleSaveEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            aria-label="Save direct edits"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold py-2 px-4 rounded-md transition-colors"
            aria-label="Cancel direct edits"
          >
            Cancel
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner text={`Loading ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}...`} />
        </div>
      ) : isDirectEditing ? (
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full flex-grow p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-slate-100 placeholder-slate-400 resize-y custom-scrollbar"
          rows={15}
          aria-label={`Edit content for ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}`}
        />
      ) : (
        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-sky-300 prose-strong:text-sky-200 overflow-y-auto flex-grow p-3 rounded bg-slate-900/50 custom-scrollbar border border-slate-700/50 shadow-inner">
          {content ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
          ) : (
            <p className="text-slate-400 italic">No content generated for this document yet, or an error occurred.</p>
          )}
        </div>
      )}
    </div>
  );
};
