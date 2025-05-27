
import React, { useState, useCallback, useEffect } from 'react';
import { DocumentType, GeneratedDocumentsState } from './types';
import { APP_TITLE, DOCUMENT_TYPES_ORDER, DOCUMENT_TYPE_DISPLAY_NAMES } from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IdeaInputForm } from './components/IdeaInputForm';
import { DocumentDisplay } from './components/DocumentDisplay';
import { EditModal } from './components/EditModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer'; // Import Footer
import { generateDocumentContent, refineDocumentContent } from './services/geminiService';

const App: React.FC = () => {
  const [businessIdea, setBusinessIdea] = useState<string>('');
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocumentsState>({});
  const [activeDocumentType, setActiveDocumentType] = useState<DocumentType | null>(null);
  const [editingDocument, setEditingDocument] = useState<{ type: DocumentType; content: string } | null>(null);
  
  const [isLoadingInitialDocuments, setIsLoadingInitialDocuments] = useState<boolean>(false);
  const [isLoadingSingleDocument, setIsLoadingSingleDocument] = useState<Record<DocumentType, boolean>>(
    DOCUMENT_TYPES_ORDER.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<DocumentType, boolean>)
  );
  
  const [error, setError] = useState<string | null>(null);
  const [apiKeyExists, setApiKeyExists] = useState<boolean | null>(null);
  const [showConsistencyReminder, setShowConsistencyReminder] = useState<boolean>(false);

  useEffect(() => {
    let keyFound = false;
    try {
      if (typeof process !== 'undefined' && process.env && typeof process.env.API_KEY === 'string' && process.env.API_KEY.trim() !== '') {
        keyFound = true;
      }
    } catch (e) {
      console.warn("Error accessing process.env for API_KEY check:", e);
    }

    if (!keyFound) {
      setError("API Key is missing or not accessible. Please ensure the API_KEY environment variable is set in your environment and accessible for the application to function correctly. Some features will be disabled.");
      setApiKeyExists(false);
    } else {
      setApiKeyExists(true);
      setError(null); 
    }
  }, []);

  const handleIdeaSubmit = useCallback(async (idea: string) => {
    if (!apiKeyExists) {
      setError("Cannot generate documents: API Key is missing or invalid. Please set the API_KEY environment variable.");
      return;
    }
    setBusinessIdea(idea);
    setError(null);
    setIsLoadingInitialDocuments(true);
    setGeneratedDocuments({}); 
    setActiveDocumentType(null);
    setShowConsistencyReminder(false); // Reset reminder on new idea

    const newDocuments: GeneratedDocumentsState = {};
    const currentPassLoadingStates = DOCUMENT_TYPES_ORDER.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<DocumentType, boolean>);
    setIsLoadingSingleDocument(currentPassLoadingStates);

    try {
      await Promise.all(DOCUMENT_TYPES_ORDER.map(async (docType) => {
        setIsLoadingSingleDocument(prev => ({ ...prev, [docType]: true }));
        try {
          const content = await generateDocumentContent(idea, docType);
          newDocuments[docType] = content;
        } catch (err) {
          console.error(`Error generating ${docType}:`, err);
          newDocuments[docType] = `Error generating ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}. ${err instanceof Error ? err.message : 'Please try again.'}`;
          setError(prevError => `${prevError ? prevError + '; ' : ''}Failed to generate ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}`);
        } finally {
          setIsLoadingSingleDocument(prev => ({ ...prev, [docType]: false }));
        }
      }));
      
      setGeneratedDocuments(newDocuments);
      if (DOCUMENT_TYPES_ORDER.length > 0) {
        setActiveDocumentType(DOCUMENT_TYPES_ORDER[0]);
      }
      setShowConsistencyReminder(true); // Show reminder after successful generation
    } catch (e) {
      console.error("Error generating initial documents:", e);
      setError("An error occurred while generating documents. Please check the console and try again.");
    } finally {
      setIsLoadingInitialDocuments(false);
    }
  }, [apiKeyExists]);

  const handleEditRequest = useCallback(async (docType: DocumentType, currentContent: string, editPrompt: string) => {
    if (!apiKeyExists) {
      setError("Cannot refine document: API Key is missing or invalid.");
      return;
    }
    setError(null);
    setIsLoadingSingleDocument(prev => ({ ...prev, [docType]: true }));
    setEditingDocument(null); 

    try {
      const contentToRefine = generatedDocuments[docType] || currentContent;
      const refinedContent = await refineDocumentContent(docType, contentToRefine, editPrompt);
      setGeneratedDocuments(prevDocs => ({
        ...prevDocs,
        [docType]: refinedContent,
      }));
      setShowConsistencyReminder(true); // Ensure reminder is visible after edits
    } catch (e) {
      console.error(`Error refining ${docType}:`, e);
      setError(`Failed to refine ${DOCUMENT_TYPE_DISPLAY_NAMES[docType]}. ${e instanceof Error ? e.message : 'Please try again.'}`);
    } finally {
      setIsLoadingSingleDocument(prev => ({ ...prev, [docType]: false }));
    }
  }, [apiKeyExists, generatedDocuments]);

  const handleSaveDirectEdit = useCallback((docType: DocumentType, newContent: string) => {
    setGeneratedDocuments(prevDocs => ({
      ...prevDocs,
      [docType]: newContent,
    }));
    setShowConsistencyReminder(true); // Ensure reminder is visible after edits
  }, []);

  const openEditModal = (docType: DocumentType) => {
    const content = generatedDocuments[docType];
    if (content) {
      setEditingDocument({ type: docType, content });
    }
  };

  const closeEditModal = () => {
    setEditingDocument(null);
  };

  const currentDocumentContent = activeDocumentType ? generatedDocuments[activeDocumentType] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100" role="application">
      <Header title={APP_TITLE} />
      
      {apiKeyExists === null && (
        <div role="alert" aria-live="polite" className="bg-blue-600 text-white p-3 m-4 rounded-md text-sm text-center shadow-lg">
          <p>Verifying API Key status...</p>
        </div>
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-700 border border-red-900 text-white p-3 m-4 rounded-md text-sm text-center shadow-lg">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {businessIdea && apiKeyExists && (
          <Sidebar
            documentTypes={DOCUMENT_TYPES_ORDER}
            activeDocumentType={activeDocumentType}
            onSelectDocumentType={setActiveDocumentType}
            isLoadingInitial={isLoadingInitialDocuments}
            isLoadingIndividual={isLoadingSingleDocument}
          />
        )}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-800 flex flex-col" role="main">
          <div className="flex-grow">
            {!businessIdea && apiKeyExists !== false && (
              <IdeaInputForm 
                onSubmit={handleIdeaSubmit} 
                isLoading={isLoadingInitialDocuments} 
                disabled={apiKeyExists === false} 
              />
            )}
            {!businessIdea && apiKeyExists === false && !error && (
              <div className="max-w-2xl mx-auto p-6 bg-slate-800 shadow-xl rounded-lg text-center">
                  <h2 className="text-2xl font-semibold mb-6 text-sky-400">Describe Your Business Idea</h2>
                  <p className="text-yellow-400 mb-4">API Key is missing. Document generation is disabled. Please set the API_KEY environment variable.</p>
              </div>
            )}

            {businessIdea && apiKeyExists && isLoadingInitialDocuments && !activeDocumentType && (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner text="Generating initial documents... This may take a moment." />
              </div>
            )}

            {businessIdea && apiKeyExists && activeDocumentType && currentDocumentContent !== undefined && (
              <DocumentDisplay
                docType={activeDocumentType}
                content={currentDocumentContent || ''}
                isLoading={isLoadingSingleDocument[activeDocumentType]}
                onEdit={() => openEditModal(activeDocumentType)}
                disabled={!apiKeyExists || isLoadingSingleDocument[activeDocumentType]}
                onSaveDirectEdit={handleSaveDirectEdit}
                businessIdeaTitle={businessIdea}
              />
            )}

            {businessIdea && apiKeyExists && activeDocumentType && currentDocumentContent === undefined && !isLoadingInitialDocuments && !isLoadingSingleDocument[activeDocumentType] && (
              <div className="text-center py-10 text-slate-400">
                <p>Select a document type from the sidebar to view its content. If generation failed for this document, you might need to try submitting the idea again or check error messages.</p>
              </div>
            )}
            
            {businessIdea && !apiKeyExists && (
              <div className="flex flex-col justify-center items-center h-full text-slate-400 text-center p-4">
                <h3 className="text-xl font-semibold mb-3">Business Idea Submitted</h3>
                <p>However, document generation and refinement are currently unavailable due to an issue with the API Key.</p>
                <p className="mt-2">Please ensure the <code>API_KEY</code> environment variable is correctly set and accessible.</p>
              </div>
            )}
          </div>
           {showConsistencyReminder && businessIdea && apiKeyExists && (
            <div className="mt-4 p-3 bg-sky-800/50 border border-sky-700 text-sky-200 rounded-md text-sm shadow-md" role="status">
              <p><strong>Reminder:</strong> Significant changes to one document (e.g., altering your core idea in the Proposal) may require you to manually review and refine other related documents to ensure overall consistency. Use the "Direct Edit" or "Refine with AI" options on other documents as needed.</p>
            </div>
          )}
        </main>
      </div>
      {editingDocument && apiKeyExists && (
        <EditModal
          docType={editingDocument.type}
          currentContent={generatedDocuments[editingDocument.type] || editingDocument.content}
          onClose={closeEditModal}
          onSubmit={handleEditRequest}
          isLoading={isLoadingSingleDocument[editingDocument.type]}
          disabled={!apiKeyExists}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;
