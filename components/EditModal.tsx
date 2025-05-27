
import React, { useState } from 'react';
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_DISPLAY_NAMES } from '../constants';
import { LoadingSpinnerIcon } from './LoadingSpinner';

interface EditModalProps {
  docType: DocumentType;
  currentContent: string; // Not directly used for display in textarea, but good for context or future use.
  onClose: () => void;
  onSubmit: (docType: DocumentType, currentContent: string, editRequest: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({ docType, currentContent, onClose, onSubmit, isLoading, disabled }) => {
  const [editRequest, setEditRequest] = useState<string>('');

  const handleSubmit = () => {
    if (editRequest.trim() && !isLoading && !disabled) {
      onSubmit(docType, currentContent, editRequest.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="bg-slate-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h3 className="text-2xl font-semibold mb-4 text-sky-400">Refine {DOCUMENT_TYPE_DISPLAY_NAMES[docType]}</h3>
        {disabled && (
           <p className="text-center text-yellow-400 mb-4">
             API Key is missing. Document refinement is disabled.
           </p>
        )}
        <div className="mb-4 flex-grow overflow-y-auto">
          <label htmlFor="editRequest" className="block text-sm font-medium text-slate-300 mb-1">
            Describe the changes you'd like:
          </label>
          <textarea
            id="editRequest"
            value={editRequest}
            onChange={(e) => setEditRequest(e.target.value)}
            placeholder="e.g., 'Emphasize the eco-friendly aspects more in the solution section.' or 'Add a section about potential risks and mitigations.'"
            className="w-full h-40 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-slate-100 placeholder-slate-400 resize-y"
            rows={5}
            disabled={isLoading || disabled}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-auto pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || disabled || !editRequest.trim()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinnerIcon />
                Refining...
              </>
            ) : (
              'Submit Refinement'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
