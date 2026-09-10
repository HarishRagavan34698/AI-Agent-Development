import OpenAI from 'openai';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
export async function generate(system, input) {
    if (!openai)
        return { provider: 'local', text: JSON.stringify({ received: input, note: 'Configure OPENAI_API_KEY for production reasoning.' }) };
    const response = await openai.responses.create({ model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini', instructions: system, input: JSON.stringify(input) });
    return { provider: 'openai', text: response.output_text };
}
export async function searchWeb(query) {
    if (!process.env.TAVILY_API_KEY)
        return { provider: 'local', sources: [`Local research placeholder for: ${query}`] };
    const response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, search_depth: 'advanced', max_results: 5 }) });
    if (!response.ok)
        throw new Error(`Research provider returned ${response.status}`);
    const data = await response.json();
    return { provider: 'tavily', sources: (data.results ?? []).map((item) => ({ title: item.title, url: item.url, excerpt: item.content })) };
}
