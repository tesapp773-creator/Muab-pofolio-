export interface ToolField {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

export interface BusinessTool {
  slug: string;
  title: string;
  description: string;
  category: 'Marketing' | 'Writing' | 'Planning' | 'Productivity';
  fields: ToolField[];
  buildPrompt: (values: Record<string, string>) => string;
}

export const BUSINESS_TOOLS: BusinessTool[] = [
  {
    slug: 'marketing-email',
    title: 'Marketing Email',
    description: 'Draft a promotional or announcement email for your audience.',
    category: 'Marketing',
    fields: [
      { name: 'goal', label: 'What is this email for?', type: 'text', required: true, placeholder: 'Announce a 20% off summer sale' },
      { name: 'audience', label: 'Audience', type: 'text', placeholder: 'Existing customers' },
      { name: 'tone', label: 'Tone', type: 'text', placeholder: 'Friendly and upbeat' },
    ],
    buildPrompt: (v) =>
      `Write a marketing email. Goal: ${v.goal}. Audience: ${v.audience || 'general customers'}. Tone: ${v.tone || 'professional and friendly'}. Include a subject line, a short body, and a clear call to action.`,
  },
  {
    slug: 'social-post',
    title: 'Social Media Post',
    description: 'Generate a post for Instagram, LinkedIn, X, or Facebook.',
    category: 'Marketing',
    fields: [
      { name: 'platform', label: 'Platform', type: 'text', required: true, placeholder: 'LinkedIn' },
      { name: 'topic', label: 'Topic', type: 'textarea', required: true, placeholder: 'Launching our new product line' },
    ],
    buildPrompt: (v) => `Write a ${v.platform} post about: ${v.topic}. Match the typical style and length conventions of that platform. Include relevant hashtags if appropriate.`,
  },
  {
    slug: 'business-plan-outline',
    title: 'Business Plan Outline',
    description: 'Get a structured outline for a business plan.',
    category: 'Planning',
    fields: [
      { name: 'idea', label: 'Business idea', type: 'textarea', required: true, placeholder: 'A subscription box for local coffee roasters' },
    ],
    buildPrompt: (v) => `Create a business plan outline for this idea: ${v.idea}. Include sections for Executive Summary, Market Analysis, Business Model, Marketing Strategy, Operations, and Financial Projections — with 2-3 bullet points of guidance under each.`,
  },
  {
    slug: 'proposal',
    title: 'Client Proposal',
    description: 'Draft a proposal for a prospective client or partner.',
    category: 'Writing',
    fields: [
      { name: 'client', label: 'Client / project', type: 'text', required: true, placeholder: 'Website redesign for Acme Corp' },
      { name: 'details', label: 'Key details', type: 'textarea', placeholder: 'Scope, timeline, budget range, etc.' },
    ],
    buildPrompt: (v) => `Write a professional proposal for: ${v.client}. Details: ${v.details || 'not specified — use reasonable placeholders'}. Include an overview, scope of work, timeline, and pricing structure section.`,
  },
  {
    slug: 'summarizer',
    title: 'Summarizer',
    description: 'Condense a long piece of text into key points.',
    category: 'Productivity',
    fields: [{ name: 'text', label: 'Text to summarize', type: 'textarea', required: true }],
    buildPrompt: (v) => `Summarize the following text into a short paragraph followed by 3-5 key bullet points:\n\n${v.text}`,
  },
  {
    slug: 'translator',
    title: 'Translator',
    description: 'Translate business text while preserving tone.',
    category: 'Productivity',
    fields: [
      { name: 'language', label: 'Target language', type: 'text', required: true, placeholder: 'Spanish' },
      { name: 'text', label: 'Text to translate', type: 'textarea', required: true },
    ],
    buildPrompt: (v) => `Translate the following text into ${v.language}, preserving tone and formatting:\n\n${v.text}`,
  },
];

export function getToolBySlug(slug: string): BusinessTool | undefined {
  return BUSINESS_TOOLS.find((t) => t.slug === slug);
}
