import { useMemo, useState } from 'react'

type Status = 'Live' | 'Building' | 'Planned'
type View = 'Overview' | 'Agent Library' | 'Workflows' | 'Evaluations'
type Agent = { name: string; domain: string; description: string; status: Status; metric: string; metricLabel: string; color: string; capabilities: string[] }
type TaskResult = { agent: string; summary: string; score: string }

const agents: Agent[] = [
  { name: 'Sales Agent', domain: 'Revenue', description: 'Qualify leads, schedule meetings, and keep CRM records current.', status: 'Live', metric: '<5m', metricLabel: 'response time', color: 'coral', capabilities: ['Lead qualification', 'Lead scoring', 'Meeting scheduling', 'CRM updates'] },
  { name: 'Research Agent', domain: 'Intelligence', description: 'Turn competitor, market, and education signals into briefings.', status: 'Building', metric: '20', metricLabel: 'reports / month', color: 'blue', capabilities: ['Competitor monitoring', 'Trend analysis', 'Market research', 'Product research'] },
  { name: 'Support Agent', domain: 'Experience', description: 'Resolve student questions across chat, WhatsApp, and email.', status: 'Building', metric: '90%', metricLabel: 'resolution target', color: 'mint', capabilities: ['FAQ handling', 'Course guidance', 'Troubleshooting', 'Omnichannel support'] },
  { name: 'School Outreach Agent', domain: 'Partnerships', description: 'Research schools and run personalized partnership sequences.', status: 'Planned', metric: '100', metricLabel: 'activities / week', color: 'yellow', capabilities: ['School research', 'Personalized outreach', 'Follow-up management', 'CRM updates'] },
  { name: 'Content Research Agent', domain: 'Marketing', description: 'Spot hooks, trends, and opportunities before they peak.', status: 'Planned', metric: '20', metricLabel: 'opportunities / week', color: 'lavender', capabilities: ['Trend research', 'Hook discovery', 'Content monitoring', 'Opportunity detection'] },
  { name: 'HR Agent', domain: 'People', description: 'Shortlist candidates and remove friction from hiring operations.', status: 'Planned', metric: '↓', metricLabel: 'hiring time', color: 'peach', capabilities: ['Resume screening', 'Candidate ranking', 'Interview scheduling', 'HR FAQs'] },
  { name: 'Learning Coach Agent', domain: 'Learning', description: 'Coach every learner with timely recommendations and support.', status: 'Planned', metric: '↑', metricLabel: 'completion rate', color: 'coral', capabilities: ['Recommendations', 'Motivation', 'Progress tracking', 'Revision support'] },
  { name: 'Analytics Agent', domain: 'Operations', description: 'Convert business signals into clear reports and decisions.', status: 'Planned', metric: '100%', metricLabel: 'automated reports', color: 'blue', capabilities: ['KPI analysis', 'Dashboard monitoring', 'Weekly reports', 'Anomaly detection'] },
  { name: 'SOP Agent', domain: 'Operations', description: 'Answer operational questions with grounded process guidance.', status: 'Planned', metric: '90%', metricLabel: 'resolution target', color: 'mint', capabilities: ['SOP retrieval', 'Process guidance', 'Policy assistance', 'Source citations'] },
  { name: 'Orchestration System', domain: 'Platform', description: 'Coordinate specialist agents into reliable business workflows.', status: 'Building', metric: '04', metricLabel: 'agents in pipeline', color: 'yellow', capabilities: ['Routing', 'Handoffs', 'Retries', 'Human approval gates'] },
  { name: 'Evaluation Monitor', domain: 'Platform', description: 'Measure accuracy, completion, satisfaction, and hallucinations.', status: 'Building', metric: '95%', metricLabel: 'accuracy target', color: 'lavender', capabilities: ['Accuracy scoring', 'Task completion', 'Satisfaction', 'Hallucination checks'] },
  { name: 'Agent Marketplace', domain: 'Platform', description: 'Package trusted internal agents for reuse across Edulenza.', status: 'Planned', metric: '20', metricLabel: 'agent target', color: 'peach', capabilities: ['Agent catalog', 'Versioning', 'Permissions', 'Usage analytics'] },
]

const navItems: View[] = ['Overview', 'Agent Library', 'Workflows', 'Evaluations']

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status ${status.toLowerCase()}`}><span />{status}</span>
}

function AgentCard({ agent, onOpen }: { agent: Agent; onOpen: (agent: Agent) => void }) {
  return <article className="agent-card"><div className={`agent-icon ${agent.color}`}>{agent.name.charAt(0)}</div><div className="agent-topline"><span className="agent-domain">{agent.domain}</span><StatusBadge status={agent.status} /></div><h3>{agent.name}</h3><p>{agent.description}</p><div className="card-bottom"><strong>{agent.metric}</strong><span>{agent.metricLabel}</span><button aria-label={`Open ${agent.name}`} onClick={() => onOpen(agent)}>↗</button></div></article>
}

function taskFor(agent: Agent): TaskResult {
  const results: Record<string, string> = {
    'Sales Agent': 'Lead scored 82/100. Recommend a discovery call within 5 minutes.',
    'Research Agent': '14 sources reviewed. Three market shifts are ready for a cited briefing.',
    'Support Agent': 'Answer grounded in the course FAQ. Resolution recommended with confidence.',
    'School Outreach Agent': 'Five high-fit schools identified and personalized outreach drafted.',
    'Content Research Agent': 'Seven content hooks detected from current education trends.',
    'HR Agent': 'Candidate ranked against role criteria. Interview slots are ready to propose.',
    'Learning Coach Agent': 'Next study session created from progress and revision signals.',
    'Analytics Agent': 'Weekly KPI report generated. One anomaly needs operator review.',
    'SOP Agent': 'Process answer retrieved with source reference and approval requirement.',
    'Orchestration System': 'Sales, Research, and Meeting steps completed with one approval gate.',
    'Evaluation Monitor': 'Latest run scored for accuracy, completion, satisfaction, and grounding.',
    'Agent Marketplace': 'Agent package validated with permissions, version, and usage metadata.',
  }
  return { agent: agent.name, summary: results[agent.name], score: agent.name === 'Evaluation Monitor' ? '95.1%' : '92.4%' }
}

function AgentLibrary({ onOpen }: { onOpen: (agent: Agent) => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | Status>('All')
  const filteredAgents = useMemo(() => agents.filter((agent) => (filter === 'All' || agent.status === filter) && `${agent.name} ${agent.domain} ${agent.description}`.toLowerCase().includes(query.toLowerCase())), [filter, query])
  return <><div className="section-heading library-heading"><div><p className="eyebrow">REUSABLE WORKFORCE</p><h2>Agent library</h2></div><span className="library-count">{filteredAgents.length} of {agents.length} agents</span></div><div className="library-tools"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" aria-label="Search agents" /></label><div className="filter-tabs">{(['All', 'Live', 'Building', 'Planned'] as const).map((option) => <button className={filter === option ? 'selected' : ''} key={option} onClick={() => setFilter(option)}>{option}</button>)}</div></div><section className="agent-grid">{filteredAgents.map((agent) => <AgentCard agent={agent} onOpen={onOpen} key={agent.name} />)}</section></>
}

function Overview({ runWorkflow, onOpen }: { runWorkflow: () => void; onOpen: (agent: Agent) => void }) {
  return <><section className="page-intro"><div><p className="eyebrow">THURSDAY, 28 AUGUST 2026</p><h1>Good morning, Aarav<span>.</span></h1><p className="intro-copy">Your digital workforce is learning, thinking, and getting work done.</p></div><button className="primary-button" onClick={runWorkflow}><span>Run a workflow</span><b>↗</b></button></section><section className="metrics" aria-label="Platform metrics"><div><span className="metric-label">Active agents</span><strong>02 <i>/ 12</i></strong><span className="metric-trend up">+1 this week</span></div><div><span className="metric-label">Tasks completed</span><strong>1,284</strong><span className="metric-trend up">+18.4%</span></div><div><span className="metric-label">Avg. task accuracy</span><strong>94.2<span>%</span></strong><span className="metric-trend neutral">Last 30 days</span></div><div><span className="metric-label">Hours saved</span><strong>86.5</strong><span className="metric-trend up">+12.8%</span></div></section><section className="section-heading"><div><p className="eyebrow">YOUR WORKFORCE</p><h2>Agent workstreams</h2></div><button className="text-button" onClick={() => onOpen(agents[0])}>Open Sales Agent <span>→</span></button></section><section className="agent-grid">{agents.slice(0, 6).map((agent) => <AgentCard agent={agent} onOpen={onOpen} key={agent.name} />)}</section></>
}

function Workflows({ runWorkflow }: { runWorkflow: () => void }) {
  return <><div className="section-heading library-heading"><div><p className="eyebrow">OBSERVE → REASON → DECIDE → ACT</p><h2>Workflow studio</h2></div><button className="primary-button" onClick={runWorkflow}><span>Run lead workflow</span><b>↗</b></button></div><section className="workflow-grid"><article className="workflow-card featured"><div className="workflow-number">01</div><div><span className="workflow-status">READY TO RUN</span><h3>Qualify and convert a new lead</h3><p>Sales Agent qualifies the lead, Research Agent enriches context, then the Meeting Agent proposes the next step.</p><div className="pipeline"><span>Sales</span><b>→</b><span>Research</span><b>→</b><span>Meeting</span></div></div></article><article className="workflow-card"><div className="workflow-number">02</div><div><span className="workflow-status">DRAFT</span><h3>Weekly intelligence briefing</h3><p>Collect competitor signals, identify market changes, and send a cited summary to the team.</p><button className="outline-button">Configure workflow <span>→</span></button></div></article></section><div className="workflow-note"><span className="status-dot" /> Human approval gates are enabled for external messages and CRM updates.</div></>
}

function Evaluations() {
  return <><div className="section-heading library-heading"><div><p className="eyebrow">QUALITY CONTROL</p><h2>Evaluation monitor</h2></div><span className="live-pill"><span /> Monitoring</span></div><section className="evaluation-grid"><div className="evaluation-card"><span>Task accuracy</span><strong>94.2%</strong><div className="mini-bar"><span style={{ width: '94%' }} /></div><small>Target 95%</small></div><div className="evaluation-card"><span>Task completion</span><strong>91.8%</strong><div className="mini-bar"><span style={{ width: '92%' }} /></div><small>Across 1,284 tasks</small></div><div className="evaluation-card"><span>Hallucination rate</span><strong>1.8%</strong><div className="mini-bar warning"><span style={{ width: '18%' }} /></div><small>Below 3% threshold</small></div></section><div className="evaluation-table"><div className="table-heading"><span>AGENT</span><span>ACCURACY</span><span>STATUS</span></div>{agents.slice(0, 5).map((agent, index) => <div className="table-row" key={agent.name}><strong>{agent.name}</strong><span>{index === 0 ? '96.4%' : index === 1 ? '93.1%' : '91.8%'}</span><StatusBadge status={agent.status} /></div>)}</div></>
}

function App() {
  const [activeView, setActiveView] = useState<View>('Overview')
  const [isRunning, setIsRunning] = useState(false)
  const [activity, setActivity] = useState('Sales Agent is ready for a new lead')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null)
  const runWorkflow = () => { setIsRunning(true); setActivity('Sales → Research → Meeting workflow is running'); window.setTimeout(() => { setIsRunning(false); setActivity('Lead qualified and next action recommended') }, 1200) }
  const runAgentTask = (agent: Agent) => { const result = taskFor(agent); setTaskResult(result); setActivity(`${agent.name} completed a local MVP task`); setIsRunning(false) }
  const openAgent = (agent: Agent) => setSelectedAgent(agent)
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">E</span><span>edulenza<br /><small>agent studio</small></span></div><div className="workspace-label">Workspace</div><nav aria-label="Main navigation">{navItems.map((item) => <button className={activeView === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => setActiveView(item)}><span className="nav-dot" />{item}<span className="nav-arrow">›</span></button>)}</nav><div className="sidebar-footer"><span className="status-dot" /> All systems operational <span className="version">v0.1</span></div></aside><main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> {activeView}</div><div className="top-actions"><button className="icon-button" aria-label="Notifications">○</button><div className="avatar">AK</div><span className="user-name">Aarav Kapoor</span></div></header>{activeView === 'Overview' && <Overview runWorkflow={runWorkflow} onOpen={openAgent} />}{activeView === 'Agent Library' && <AgentLibrary onOpen={openAgent} />}{activeView === 'Workflows' && <Workflows runWorkflow={runWorkflow} />}{activeView === 'Evaluations' && <Evaluations />}<section className={`lower-grid ${isRunning ? 'is-running' : ''}`}><div className="activity-panel"><div className="panel-heading"><div><p className="eyebrow">LIVE FEED</p><h2>Latest activity</h2></div><span className="live-pill"><span /> Live</span></div><div className="activity-item"><span className="activity-marker coral-bg">S</span><div><strong>{activity}</strong><p>Agent platform <span>·</span> just now</p></div><span className="activity-arrow">↗</span></div><div className="activity-item"><span className="activity-marker blue-bg">R</span><div><strong>Research Agent scanned 14 new sources</strong><p>Research Agent <span>·</span> 18 min ago</p></div><span className="activity-arrow">↗</span></div></div><div className="next-panel"><p className="eyebrow">PLATFORM FOUNDATION</p><h2>Build the connective tissue.</h2><p>Shared memory, tools, approvals, and evaluation make every specialist agent safer to reuse.</p><button className="outline-button" onClick={() => setActiveView('Workflows')}>Explore workflows <span>→</span></button><div className="progress-label"><span>Local MVP coverage</span><span>12 / 12</span></div><div className="progress-bar"><span style={{ width: '100%' }} /></div></div></section></main>{selectedAgent && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedAgent(null)}><section className="agent-modal" role="dialog" aria-modal="true" aria-label={selectedAgent.name} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedAgent(null)} aria-label="Close">×</button><div className={`agent-icon ${selectedAgent.color}`}>{selectedAgent.name.charAt(0)}</div><StatusBadge status={selectedAgent.status} /><h2>{selectedAgent.name}</h2><p>{selectedAgent.description}</p><h3>Capabilities</h3><ul>{selectedAgent.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul>{taskResult?.agent === selectedAgent.name && <div className="task-result"><strong>Task complete · {taskResult.score}</strong><p>{taskResult.summary}</p></div>}<button className="primary-button" onClick={() => runAgentTask(selectedAgent)}><span>Run local task</span><b>↗</b></button></section></div>}</div>
}

export default App
