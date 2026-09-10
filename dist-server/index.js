import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initDb, listActivities } from './db.js';
import { analyzeMetrics, answerSop, analyticsSchema, candidateSchema, coachLearner, contentSchema, createResearchReport, discoverContent, draftOutreach, evaluateTask, evaluationSchema, learnerSchema, leadSchema, marketplaceSchema, orchestrationSchema, publishAgent, qualifyLead, questionSchema, resolveSupport, runOrchestration, screenCandidate, schoolSchema, sopSchema } from './agents.js';
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '1mb' }));
const parse = (schema, body) => { const result = schema.safeParse(body); if (!result.success)
    throw Object.assign(new Error('Invalid request'), { status: 400, details: result.error?.issues }); return result.data; };
app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'edulenza-agent-platform', mode: process.env.OPENAI_API_KEY ? 'production-provider' : 'local-fallback' }));
app.get('/api/activity', async (_request, response) => response.json(await listActivities()));
app.post('/api/sales/leads/qualify', async (request, response, next) => { try {
    response.json(await qualifyLead(parse(leadSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/support/resolve', async (request, response, next) => { try {
    response.json(await resolveSupport(parse(questionSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/research/reports', async (request, response, next) => { try {
    response.json(await createResearchReport(String(request.body.query ?? 'education technology trends')));
}
catch (error) {
    next(error);
} });
app.post('/api/outreach/draft', async (request, response, next) => { try {
    response.json(await draftOutreach(parse(schoolSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/content/opportunities', async (request, response, next) => { try {
    response.json(await discoverContent(parse(contentSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/hr/candidates/screen', async (request, response, next) => { try {
    response.json(await screenCandidate(parse(candidateSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/learning/coach', async (request, response, next) => { try {
    response.json(await coachLearner(parse(learnerSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/analytics/analyze', async (request, response, next) => { try {
    response.json(await analyzeMetrics(parse(analyticsSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/sop/answer', async (request, response, next) => { try {
    response.json(await answerSop(parse(sopSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/orchestration/run', async (request, response, next) => { try {
    response.json(await runOrchestration(parse(orchestrationSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/evaluations/run', async (request, response, next) => { try {
    response.json(await evaluateTask(parse(evaluationSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.post('/api/marketplace/publish', async (request, response, next) => { try {
    response.json(await publishAgent(parse(marketplaceSchema, request.body)));
}
catch (error) {
    next(error);
} });
app.use((error, _request, response, _next) => response.status(error.status ?? 500).json({ error: error.message, details: error.details }));
const port = Number(process.env.PORT ?? 8787);
initDb().then(() => app.listen(port, () => console.log(`Edulenza API listening on http://localhost:${port}`))).catch((error) => { console.error(error); process.exit(1); });
