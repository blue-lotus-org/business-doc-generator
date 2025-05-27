
import React, { useState } from 'react';
import { LoadingSpinnerIcon } from './LoadingSpinner';

interface IdeaInputFormProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({ onSubmit, isLoading, disabled }) => {
  const [idea, setIdea] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading && !disabled) {
      onSubmit(idea.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-sky-400 text-center">Describe Your Business Idea</h2>
      {disabled && (
         <p className="text-center text-yellow-400 mb-4">
           API Key is missing. Document generation is disabled.
         </p>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="E.g., A platform for connecting local artists with buyers, featuring virtual galleries and secure transactions..."
          className="w-full h-40 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-700 text-slate-100 placeholder-slate-400 transition-shadow duration-150 ease-in-out"
          rows={6}
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          disabled={isLoading || disabled || !idea.trim()}
          className="mt-6 w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon />
              Generating...
            </>
          ) : (
            'Generate Documents'
          )}
        </button>
      </form>
    </div>
  );
};
