
import React from 'react';
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_DISPLAY_NAMES } from '../constants';
import { LoadingSpinnerIcon } from './LoadingSpinner'; // Assuming a smaller icon variant

interface SidebarProps {
  documentTypes: DocumentType[];
  activeDocumentType: DocumentType | null;
  onSelectDocumentType: (docType: DocumentType) => void;
  isLoadingInitial: boolean;
  isLoadingIndividual: Record<DocumentType, boolean>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documentTypes,
  activeDocumentType,
  onSelectDocumentType,
  isLoadingInitial,
  isLoadingIndividual
}) => {
  return (
    <aside className="w-64 bg-slate-850 p-4 border-r border-slate-700 overflow-y-auto shadow-lg flex-shrink-0">
      <h2 className="text-xl font-semibold mb-4 text-sky-400">Documents</h2>
      {isLoadingInitial && (
        <div className="text-slate-400 text-sm mb-2">Generating all documents...</div>
      )}
      <nav>
        <ul>
          {documentTypes.map((docType) => (
            <li key={docType} className="mb-2">
              <button
                onClick={() => onSelectDocumentType(docType)}
                disabled={isLoadingInitial || isLoadingIndividual[docType]}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-150 ease-in-out flex items-center justify-between
                  ${activeDocumentType === docType
                    ? 'bg-sky-600 text-white font-semibold shadow-md'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }
                  ${(isLoadingInitial || isLoadingIndividual[docType]) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span>{DOCUMENT_TYPE_DISPLAY_NAMES[docType]}</span>
                {isLoadingIndividual[docType] && <LoadingSpinnerIcon size="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
