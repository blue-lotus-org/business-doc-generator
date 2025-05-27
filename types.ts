export enum DocumentType {
  PROPOSAL = 'Proposal',
  BUSINESS_PLAN = 'BusinessPlan',
  MARKET_RESEARCH = 'MarketResearch', // Added new document type
  ROADMAP = 'Roadmap',
  MILESTONES = 'Milestones',
  FINANCIAL_PROJECTION = 'FinancialProjection',
  TECHNICAL_PRD = 'TechnicalPRD',
}

export interface GeneratedDocument {
  type: DocumentType;
  content: string;
  isGenerating?: boolean; // To show loading state per document
}

export type GeneratedDocumentsState = {
  [key in DocumentType]?: string;
};

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}