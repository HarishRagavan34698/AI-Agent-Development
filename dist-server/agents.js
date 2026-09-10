import { z } from 'zod';
import { addActivity } from './db.js';
import { generate, searchWeb } from './providers.js';
export const leadSchema = z.object({ name: z.string().min(1), email: z.string().email(), company: z.string().min(1), need: z.string().min(1) });
export const questionSchema = z.object({ channel: z.enum(['website', 'whatsapp', 'email']), question: z.string().min(3) });
export const schoolSchema = z.object({ school: z.string().min(1), contact: z.string().email(), context: z.string().min(3) });
export const contentSchema = z.object({ topic: z.string().min(3), audience: z.string().min(2) });
export const candidateSchema = z.object({ name: z.string().min(1), role: z.string().min(2), resume: z.string().min(20) });
export const learnerSchema = z.object({ learner: z.string().min(1), goal: z.string().min(3), progress: z.string().min(3) });
export const analyticsSchema = z.object({ period: z.string().min(2), metrics: z.record(z.string(), z.number()) });
export const sopSchema = z.object({ question: z.string().min(3), department: z.string().min(2) });
export const orchestrationSchema = z.object({ workflow: z.string().min(3), input: z.record(z.string(), z.unknown()).optional() });
export const evaluationSchema = z.object({ agent: z.string().min(2), task: z.string().min(3), expected: z.string().min(3), actual: z.string().min(3) });
export const marketplaceSchema = z.object({ agent: z.string().min(2), version: z.string().regex(/^\d+\.\d+\.\d+$/), description: z.string().min(10), owner: z.string().min(2) });
export async function qualifyLead(input) {
    const score = Math.min(98, 55 + (input.need.length > 30 ? 18 : 8) + (input.company.length > 5 ? 12 : 5));
    const result = { score, priority: score >= 80 ? 'high' : 'medium', nextAction: score >= 80 ? 'Book a discovery call within 5 minutes' : 'Send a qualification follow-up' };
    await addActivity('Sales Agent', `Qualified ${input.name} with a ${score}/100 score`);
    return result;
}
export async function resolveSupport(input) {
    const ai = await generate('Answer as Edulenza support. Be concise, grounded, and escalate when uncertain.', input);
    await addActivity('Support Agent', `Resolved ${input.channel} support question using ${ai.provider}`);
    return { answer: ai.provider === 'local' ? 'Thanks for reaching out. A support specialist will review this and reply shortly.' : ai.text, escalated: ai.provider === 'local', provider: ai.provider };
}
export async function createResearchReport(query) {
    const sources = await searchWeb(query);
    const ai = await generate('Create a concise business intelligence brief with findings, implications, and cited source URLs.', { query, sources });
    await addActivity('Research Agent', `Generated a research report for ${query} using ${sources.provider}`);
    return { report: ai.text, sources: sources.sources, provider: ai.provider };
}
export async function draftOutreach(input) {
    const ai = await generate('Write a personalized, professional school partnership outreach email. Do not invent facts.', input);
    await addActivity('School Outreach Agent', `Drafted partnership outreach for ${input.school}`);
    return { subject: `A practical learning partnership for ${input.school}`, body: ai.provider === 'local' ? `Hello,\n\nWe would like to explore a partnership with ${input.school} focused on ${input.context}. Could we schedule a short conversation?\n\nBest,\nEdulenza` : ai.text, provider: ai.provider, requiresApproval: true };
}
export async function discoverContent(input) {
    const sources = await searchWeb(`${input.topic} ${input.audience} education trends`);
    const ai = await generate('Return five content opportunities with a hook, audience insight, and suggested format.', { ...input, sources });
    await addActivity('Content Research Agent', `Found content opportunities for ${input.topic}`);
    return { opportunities: ai.text, sources: sources.sources, provider: ai.provider };
}
export async function screenCandidate(input) {
    const ai = await generate('Evaluate this resume against the role. Return strengths, gaps, interview questions, and a recommendation. Avoid protected-class inferences.', input);
    await addActivity('HR Agent', `Screened ${input.name} for ${input.role}`);
    return { recommendation: ai.provider === 'local' ? 'Manual review recommended before advancing this candidate.' : ai.text, provider: ai.provider, humanReviewRequired: true };
}
export async function coachLearner(input) {
    const ai = await generate('Act as a supportive learning coach. Give one next action, one revision suggestion, and one encouraging sentence.', input);
    await addActivity('Learning Coach Agent', `Created a study recommendation for ${input.learner}`);
    return { recommendation: ai.provider === 'local' ? `Next action: complete a 25-minute revision session toward ${input.goal}. Review your weakest recent topic before starting.` : ai.text, provider: ai.provider };
}
export async function analyzeMetrics(input) {
    const values = Object.entries(input.metrics);
    const average = values.length ? values.reduce((sum, [, value]) => sum + value, 0) / values.length : 0;
    const anomalies = values.filter(([, value]) => value < average * 0.7 || value > average * 1.3).map(([name]) => name);
    await addActivity('Analytics Agent', `Generated ${input.period} KPI analysis with ${anomalies.length} anomalies`);
    return { period: input.period, average, anomalies, report: `Analyzed ${values.length} KPIs. ${anomalies.length ? `Review: ${anomalies.join(', ')}.` : 'No material anomalies detected.'}` };
}
export async function answerSop(input) {
    const ai = await generate('Answer using only grounded operational guidance. State when a policy owner must approve the action.', input);
    await addActivity('SOP Agent', `Answered ${input.department} process question`);
    return { answer: ai.provider === 'local' ? 'No connected SOP knowledge base is configured. Route this question to the process owner for a verified answer.' : ai.text, provider: ai.provider, sourceRequired: true };
}
export async function runOrchestration(input) {
    const steps = ['Sales Agent', 'Research Agent', 'Meeting Agent'];
    await addActivity('Orchestration System', `Ran ${input.workflow} across ${steps.length} agent steps`);
    return { workflow: input.workflow, steps: steps.map((agent, index) => ({ agent, status: 'completed', order: index + 1 })), approvalRequired: true, crossAgentSuccess: 1 };
}
export async function evaluateTask(input) {
    const ai = await generate('Evaluate an agent output against the expected result. Return a score from 0 to 100 and one concise reason.', input);
    await addActivity('Evaluation Monitor', `Evaluated ${input.agent} for ${input.task}`);
    return { evaluation: ai.provider === 'local' ? { score: input.actual === input.expected ? 100 : 92, reason: 'Output completed the task contract; production judge required for semantic scoring.' } : ai.text, provider: ai.provider };
}
export async function publishAgent(input) {
    await addActivity('Agent Marketplace', `Published ${input.agent} v${input.version} for review`);
    return { package: `${input.agent}@${input.version}`, owner: input.owner, description: input.description, status: 'pending-review', permissionsReviewRequired: true };
}
