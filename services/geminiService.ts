
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentType } from '../types';
import { DOCUMENT_TYPE_DISPLAY_NAMES, GEMINI_MODEL_TEXT } from '../constants';

// Updated getApiKey function for robust checking
const getApiKey = (): string => {
  let apiKey: string | undefined;
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env.API_KEY === 'string') {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env, or API_KEY is not a string:", e);
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error("API Key not found, is empty, or not accessible. Please ensure the API_KEY environment variable is correctly set.");
  }
  return apiKey;
};


const getPromptForDocumentType = (idea: string, docType: DocumentType): string => {
  const ideaPrompt = `Business Idea: "${idea}"`;
  const commonInstructions = `\n\nInstructions for AI:
- Generate only the content for the requested document section. Do not include any introductory phrases, conversational text, or markdown formatting like \`\`\`text ... \`\`\` or \`\`\`markdown ... \`\`\`.
- For any specific data points like financial figures, market sizes, or statistics that you cannot factually verify or source, use clear placeholders (e.g., "[Insert specific data here]", "[Source: research needed]", "[Estimated figure, verify with market data]") or state that the figures are illustrative. Do not invent specific numbers.
- Ensure the content is professional, well-structured, and directly usable.
- Focus on accuracy and realistic assumptions.`;

  switch (docType) {
    case DocumentType.PROPOSAL:
      return `${ideaPrompt}\n\nGenerate a comprehensive business proposal based on this idea. The proposal should include at least the following sections: Executive Summary, Problem Statement, Proposed Solution, Target Market, Competitive Analysis, Marketing and Sales Strategy, Management Team (if applicable), and Call to Action. ${commonInstructions}`;
    case DocumentType.BUSINESS_PLAN:
      return `${ideaPrompt}\n\nGenerate a detailed business plan based on this idea. The business plan should cover: Executive Summary, Company Description, Products and Services, Market Analysis (including industry overview, target market, competition), Strategy and Implementation (including marketing plan, sales plan, operations plan), Management Team, and a Financial Plan outline. For the financial plan, detail key assumptions and suggest placeholders for specific projections like income statement, cash flow, and balance sheet unless you can provide illustrative examples based on common business models for such an idea, clearly stating they are illustrative. ${commonInstructions}`;
    case DocumentType.MARKET_RESEARCH:
      return `${ideaPrompt}\n\nGenerate a market research report based on this idea. The report should include:
1.  **Target Audience:** Detailed description (demographics, psychographics, needs, pain points, buying behavior).
2.  **Market Size and Trends:** Estimation of TAM, SAM, SOM. For specific market size numbers, use placeholders like "[TAM: specific research needed]" or provide illustrative ranges if commonly known for similar ideas, stating clearly they are illustrative. Identify key industry growth trends.
3.  **Competitive Landscape:** Identify 3-5 key competitors, their main products/services, strengths, weaknesses, pricing strategies (if general knowledge, otherwise placeholder), and market positioning.
4.  **SWOT Analysis (for the business idea):** Strengths, Weaknesses, Opportunities, and Threats relevant to the market.
5.  **Potential Market Gaps & Opportunities:** Unmet customer needs or underserved segments.
${commonInstructions}`;
    case DocumentType.ROADMAP:
      return `${ideaPrompt}\n\nGenerate a strategic product roadmap for the first 1-2 years based on this idea. Outline key phases (e.g., Phase 1: MVP Development, Phase 2: Beta Launch & Feedback, Phase 3: V1.0 Launch, Phase 4: Growth & Feature Expansion). For each phase, detail: Goals, Key Features/Initiatives, Estimated Timeline (e.g., "3 months", "Q1-Y1"), and Key Metrics for Success. ${commonInstructions}`;
    case DocumentType.MILESTONES:
      return `${ideaPrompt}\n\nGenerate a list of key milestones for the first year, broken down quarterly, based on this idea. For each milestone, provide: Milestone Description, Key Performance Indicators (KPIs) (e.g., "User sign-ups: [Target Number]", "Partnerships: [Target Number]"), and Target Completion (e.g., End of Q1). Milestones should cover aspects like: Legal & Setup, Product Development, Funding (if applicable, e.g. "Secure Seed Funding: [Target Amount]"), Marketing & Sales, Team Building. ${commonInstructions}`;
    case DocumentType.FINANCIAL_PROJECTION:
      return `${ideaPrompt}\n\nProvide a high-level 3-year financial projection outline based on this idea. This should include:
1.  **Key Assumptions:** Clearly list 3-5 major assumptions (e.g., "Customer acquisition rate: [Specify rate or placeholder]", "Pricing: [Specify or placeholder]", "COGS percentage: [Specify or placeholder]").
2.  **Revenue Streams:** Identify primary ways the business will generate money.
3.  **Major Cost Categories:** (e.g., COGS/COS, R&D, Sales & Marketing, G&A, Salaries).
4.  **Projected Summary Outline (Year 1, Year 2, Year 3):** For each year, list categories for Total Revenue, Total COGS/COS, Gross Profit, Total Operating Expenses, and Net Profit/Loss Before Tax. Use placeholders like "[Projected Y1 Revenue]" or provide illustrative calculations if assumptions are clearly stated as illustrative.
${commonInstructions}`;
    case DocumentType.TECHNICAL_PRD:
      return `${ideaPrompt}\n\nGenerate a Technical Product Requirements Document (PRD) outline based on this idea. The PRD should cover: Introduction/Overview, Goals and Objectives, Target Users/User Personas, User Stories & Key Features (prioritized), Functional Requirements, Non-Functional Requirements (Performance, Scalability, Security, Usability, Reliability - use placeholders for specific metrics like "[Page load time target]"), High-Level Technical Stack Considerations, Data Management, Release Criteria. ${commonInstructions}`;
    default:
      return `Generate a detailed overview of the business idea: "${idea}". Focus on its core value proposition, target audience, and potential. ${commonInstructions}`;
  }
};

const getRefinePrompt = (docType: DocumentType, originalContent: string, editRequest: string): string => {
  const documentTypeName = DOCUMENT_TYPE_DISPLAY_NAMES[docType] || 'document';
  return `You are an AI assistant helping to refine a business document.
The original document is a ${documentTypeName}.
Here is the original content:
---
${originalContent}
---
The user wants to make the following changes or has the following request: "${editRequest}".

Instructions for AI:
- Provide only the revised ${documentTypeName} content directly. Do not include any introductory or concluding remarks like "Here is the revised document:". Do not use markdown formatting like \`\`\`text ... \`\`\` or \`\`\`markdown ... \`\`\`.
- Incorporate the user's changes.
- If the request involves data that requires external verification (e.g., specific financial numbers, market statistics), and you cannot verify it, use placeholders (e.g., "[Insert specific data here]", "[Verify this figure]") or state that the information is illustrative. Do not invent specific numbers.
- Ensure the revised document maintains a professional tone and structure suitable for a ${documentTypeName}.
- Preserve the overall purpose and core information of the original document unless specifically asked to change it.
- If the request is vague, make reasonable interpretations to improve the document.
- If the request asks to add a section, integrate it logically. If it asks to remove something, ensure the document still flows well.
- Pay attention to formatting, clarity, and conciseness.`;
};


export const generateDocumentContent = async (idea: string, docType: DocumentType): Promise<string> => {
  const apiKey = getApiKey(); 
  const ai = new GoogleGenAI({ apiKey });

  const prompt = getPromptForDocumentType(idea, docType);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.7, 
        topK: 40,
        topP: 0.95,
      }
    });
    // Ensure response.text is used directly and strip potential markdown fences
    let text = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    return text;
  } catch (error) {
    console.error(`Error generating content for ${docType} with Gemini:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate content for ${DOCUMENT_TYPE_DISPLAY_NAMES[docType] || docType}. Gemini API Error: ${message}`);
  }
};

export const refineDocumentContent = async (docType: DocumentType, originalContent: string, editRequest: string): Promise<string> => {
  const apiKey = getApiKey(); 
  const ai = new GoogleGenAI({ apiKey });
  const prompt = getRefinePrompt(docType, originalContent, editRequest);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.5, 
      }
    });
    // Ensure response.text is used directly and strip potential markdown fences
    let text = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    return text;
  } catch (error) {
    console.error(`Error refining content for ${docType} with Gemini:`, error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to refine content for ${DOCUMENT_TYPE_DISPLAY_NAMES[docType] || docType}. Gemini API Error: ${message}`);
  }
};
