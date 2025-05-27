import { DocumentType } from './types';

export const APP_TITLE = "AI Business Idea Assistant";

export const DOCUMENT_TYPES_ORDER: DocumentType[] = [
  DocumentType.PROPOSAL,
  DocumentType.BUSINESS_PLAN,
  DocumentType.MARKET_RESEARCH, // Added new document type in order
  DocumentType.ROADMAP,
  DocumentType.MILESTONES,
  DocumentType.FINANCIAL_PROJECTION,
  DocumentType.TECHNICAL_PRD,
];

export const DOCUMENT_TYPE_DISPLAY_NAMES: Record<DocumentType, string> = {
  [DocumentType.PROPOSAL]: 'Business Proposal',
  [DocumentType.BUSINESS_PLAN]: 'Business Plan',
  [DocumentType.MARKET_RESEARCH]: 'Market Research', // Added display name
  [DocumentType.ROADMAP]: 'Product Roadmap',
  [DocumentType.MILESTONES]: 'Key Milestones',
  [DocumentType.FINANCIAL_PROJECTION]: 'Financial Projections',
  [DocumentType.TECHNICAL_PRD]: 'Technical PRD',
};

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';