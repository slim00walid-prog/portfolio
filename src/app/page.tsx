"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { careerData } from "@/data/career";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Terminal,
  ChevronDown,
  BarChart3,
  Globe,
  Server,
  Bot,
  Key,
  HardDrive,
  Mail,
  Link,
  StopCircle,
  SendHorizonal,
  MessageSquare,
} from "lucide-react";

/* ──────────────────────── Counter Hook ──────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / (duration / 16));
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ──────────────────────── InView Section ──────────────────────── */
function InViewSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`section-hidden ${visible ? "section-visible" : ""} ${className}`}
      id={id}
    >
      {children}
    </section>
  );
}

/* ──────────────────────── Stat Widget ──────────────────────── */
function StatWidget({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <span
        ref={ref}
        className="block text-4xl md:text-5xl font-bold text-accent tabular-nums"
      >
        {count}
        {suffix}
      </span>
      <span className="text-sm text-text-muted mt-1 block">{label}</span>
    </motion.div>
  );
}

/* ──────────────────────── Project Card ──────────────────────── */
const PROJECT_ICONS: Record<string, React.ReactNode> = {
  "mcp-gateway": <Server className="w-5 h-5" />,
  "ai-concierge": <Bot className="w-5 h-5" />,
  "mcp-apps": <Globe className="w-5 h-5" />,
  "booking-engine": <Terminal className="w-5 h-5" />,
  "oauth-server": <Key className="w-5 h-5" />,
  "q-storage": <HardDrive className="w-5 h-5" />,
  "kpi-analytics": <BarChart3 className="w-5 h-5" />,
};

const ROLE_COLORS: Record<string, string> = {
  "Primary author": "text-mcp",
  "Key contributor": "text-accent",
  "Solo build": "text-mcp",
  Contributor: "text-secondary",
};

function ProjectCard({ project }: { project: (typeof careerData.projects)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [depth, setDepth] = useState<"simple" | "detailed" | "architecture">("simple");

  const content =
    depth === "simple"
      ? project.detailLevels.simple
      : depth === "detailed"
        ? project.detailLevels.detailed
        : project.detailLevels.architecture;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border border-border rounded-xl overflow-hidden bg-surface hover:border-border-light transition-colors"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
            {PROJECT_ICONS[project.id] || <Terminal className="w-5 h-5 text-text-muted" />}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
              <span className={`text-xs font-medium ${ROLE_COLORS[project.role] || "text-text-muted"}`}>
                {project.role}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1">{project.tagline}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-border pt-4">
              <div className="flex gap-1 mb-4 bg-surface-2 rounded-lg p-1 overflow-x-auto">
                {(["simple", "detailed", "architecture"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                      depth === d
                        ? "bg-accent text-background"
                        : "text-text-muted hover:text-foreground"
                    }`}
                  >
                    {d === "simple" ? "Simple" : d === "detailed" ? "Detailed" : "Architecture"}
                  </button>
                ))}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {project.stack.slice(0, 6).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-xs rounded-full bg-surface-2 text-text-muted border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {project.decisions.length > 0 && (
                <details className="mt-4">
                  <summary className="text-xs text-accent cursor-pointer hover:text-accent-dim transition-colors">
                    Design decisions ({project.decisions.length})
                  </summary>
                  <div className="mt-3 space-y-3">
                    {project.decisions.map((d) => (
                      <div key={d.id} className="text-xs text-foreground/70 bg-surface-2 rounded-lg p-3">
                        <div className="font-medium text-foreground mb-1">{d.problem}</div>
                        <div className="text-accent mb-1">→ {d.decision}</div>
                        <div className="text-text-muted">Trade-off: {d.tradeoff}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */
export default function Home() {
  const chatTransport = new DefaultChatTransport({ api: "/api/chat" });
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: chatTransport,
    experimental_throttle: 50,
  });
  const [localInput, setLocalInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  const suggestedQuestions = [
    "What did you build at Quicktext?",
    "What's your biggest achievement?",
    "Tell me about the MCP Gateway",
    "What are your top skills?",
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading) return;
    sendMessage({ text: localInput });
    setLocalInput("");
  };

  const handleSuggestedQuestion = (q: string) => {
    sendMessage({ text: q });
  };

  const stats = [
    { value: careerData.aggregate.jiraIssuesCompleted, label: "Issues completed", suffix: "+" },
    { value: careerData.aggregate.jiraResolutionRate, label: "Resolution rate", suffix: "%" },
    { value: careerData.aggregate.bookingEngineIntegrations, label: "BE integrations", suffix: "+" },
    { value: careerData.aggregate.mcpServersBuilt, label: "MCP servers", suffix: "" },
    { value: careerData.aggregate.highestPriorityResolved, label: "Highest-priority resolved", suffix: "" },
    { value: careerData.aggregate.companyReposContributed, label: "Repos contributed", suffix: "" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen bg-background">


      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-8 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto w-full">
          {/* Intro block */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={fadeUpItem}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mcp/10 border border-mcp/20 text-xs text-mcp">
                <span className="w-1.5 h-1.5 rounded-full bg-mcp glow-mcp" />
                MCP Server Active
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUpItem}
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              <span className="text-foreground">Walid </span>
              <span className="text-accent">Slim</span>
            </motion.h1>

            <motion.div variants={fadeUpItem} className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/50" />
              <span className="text-[10px] text-text-muted tracking-widest uppercase font-medium">
                MCP · Platform · AI
              </span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <p className="text-lg sm:text-xl md:text-2xl text-accent font-light">
                Senior Software Engineer — Backend & AI Systems
              </p>
              <p className="text-sm sm:text-base text-text-muted mt-2">
                I build the MCP infrastructure where AI agents meet real businesses.
              </p>
            </motion.div>

            <motion.div variants={fadeUpItem} className="flex flex-wrap gap-3">
              <a
                href="#work"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-dim transition-colors"
              >
                Interview my work <ChevronDown className="w-4 h-4" />
              </a>
              <a
                href="/terminal"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:border-accent transition-colors"
              >
                <Terminal className="w-4 h-4" /> Terminal
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:border-accent transition-colors"
              >
                <BarChart3 className="w-4 h-4" /> Dashboard
              </a>
            </motion.div>

            {/* MCP connect hint */}
            <motion.div
              variants={fadeUpItem}
              className="p-4 border border-border rounded-xl bg-surface/50"
            >
              <code className="text-xs terminal-text text-text-muted block break-all">
                <span className="text-mcp">$</span> claude mcp add walid-slim -- npx -y github:slim00walid-prog/portfolio
              </code>
              <p className="text-xs text-text-muted mt-2">
                This site is also an MCP server. Add it to Claude and interview my career.
                <br />
                AI agents: <span className="text-accent">POST /api/mcp</span> with {"{ \"tool\": \"about\" }"}
              </p>
            </motion.div>
          </motion.div>

          {/* Chat — below MCP hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10"
          >
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg shadow-black/20">
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mcp/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-mcp" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground leading-none block">
                      AI Interview
                    </span>
                    <span className="text-[10px] text-text-muted leading-none mt-0.5 block">
                      {status === "streaming" ? "Responding..." : "Ask me anything"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mcp animate-pulse" />
                  <span className="text-[10px] text-mcp">active</span>
                </div>
              </div>

              {/* ── Messages ── */}
              <div
                ref={chatContainerRef}
                className="h-72 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
              >
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center h-full text-center px-2"
                  >
                    <p className="text-sm text-foreground/70 mb-1 font-medium">
                      Interview my career
                    </p>
                    <p className="text-xs text-text-muted mb-6 max-w-xs leading-relaxed">
                      Pick a question below or type your own — this calls the same AI tools an agent would.
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-sm">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSuggestedQuestion(q)}
                          disabled={isLoading}
                          className="group text-left text-xs px-3.5 py-2.5 rounded-xl border border-border bg-surface-2/50 text-text-muted hover:border-accent/40 hover:text-foreground hover:bg-accent/5 transition-all duration-200 disabled:opacity-40"
                        >
                          <span className="group-hover:text-accent transition-colors">↳</span>
                          {" "}{q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={`flex items-end gap-2 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-lg bg-mcp/10 flex items-center justify-center shrink-0 mb-0.5">
                          <Bot className="w-3 h-3 text-mcp/70" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                          msg.role === "user"
                            ? "bg-accent text-background rounded-br-md"
                            : "bg-surface-2 border border-border/50 rounded-bl-md"
                        }`}
                      >
                        <div
                          className={`text-sm whitespace-pre-wrap leading-relaxed ${
                            msg.role === "user" ? "font-medium" : "text-foreground/90"
                          }`}
                        >
                          {(msg.parts as { text?: string }[])
                            .map((p: { text?: string }) => p.text || "")
                            .join("")}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2.5 pl-8"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="text-xs text-red-400/80 text-center py-2.5 px-3 rounded-xl bg-red-500/5 border border-red-500/10 mt-2">
                    {error.message}. Make sure your GROQ_API_KEY is set.
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── Input ── */}
              <form onSubmit={handleSubmit} className="border-t border-border p-3">
                <div className="flex items-center gap-2 bg-surface-2 rounded-xl border border-border focus-within:border-accent/50 transition-colors px-3 py-1.5">
                  <input
                    type="text"
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    placeholder="Ask about my career..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none disabled:opacity-50"
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stop}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!localInput.trim()}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-accent text-background hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <SendHorizonal className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION: WORK ── */}
      <InViewSection id="work" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What do you build?
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-8 sm:mb-12 max-w-2xl">
              Not a project grid — the reasoning behind the systems that matter most.
              Every project below runs in production.
            </p>
          </motion.div>

          <div className="space-y-4">
            {careerData.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </InViewSection>

      {/* ── SECTION: HOW DO YOU THINK? ── */}
      <InViewSection className="px-4 sm:px-6 py-16 sm:py-24 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How do you think?
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-8 sm:mb-12 max-w-2xl">
              Engineering principles I apply to every system.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              {
                title: "Correctness over marginal latency",
                desc: "A full tool registry every turn costs tokens but prevents silent failures. Removed a Groq intent classifier that misclassified 15% of follow-ups.",
                project: "ai-concierge",
              },
              {
                title: "Boring architecture, measured win",
                desc: "Rolling GPT-4o-mini summaries over vector RAG. No embedding infra to run, no retrieval misses to debug. ~1ms warm lookup.",
                project: "ai-concierge",
              },
              {
                title: "Single source of truth per concern",
                desc: "Provider registry in MongoDB, not config. Tools rescoped with zero redeploys. Career data in one JSON file, not scattered across docs.",
                project: "mcp-gateway",
              },
              {
                title: "Separate model from display",
                desc: "structuredContent vs _meta.widgetData in MCP Apps. The LLM sees semantics, the widget sees pixels. Never confuse the two audiences.",
                project: "mcp-apps",
              },
              {
                title: "3-service auth chain, single responsibility",
                desc: "auth2 -> nestjs-mcp -> be-mcp-server. Each layer owns one concern. Token validated at every hop. Replaceable independently.",
                project: "oauth-server",
              },
              {
                title: "Default to direct, wrap when needed",
                desc: "AI widget uses direct HTTP tools (no MCP cold-connect). The MCP wrapper is an adapter, not the core path. 1000-1400ms saved per request.",
                project: "ai-concierge",
              },
            ].map((principle) => (
              <motion.div
                key={principle.title}
                variants={fadeUpItem}
                className="border border-border rounded-xl p-5 bg-surface hover:border-border-light transition-colors"
              >
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {principle.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {principle.desc}
                </p>
                <span className="text-xs text-accent mt-3 block">
                  Used in: {careerData.projects.find((p) => p.id === principle.project)?.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </InViewSection>

      {/* ── SECTION: STATS ── */}
      <InViewSection id="stats" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What have you shipped?
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-8 sm:mb-12 max-w-2xl">
              Every number on this page is counted from Git history and Jira, not estimated.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <StatWidget
                key={stat.label}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
              />
            ))}
          </div>

         
        </div>
      </InViewSection>

      {/* ── SECTION: TIMELINE ── */}
      <InViewSection className="px-4 sm:px-6 py-16 sm:py-24 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Trajectory
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-8 sm:mb-12 max-w-2xl">
              From mathematics to MCP platform ownership — three years at Quicktext.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {careerData.timeline.map((entry, i) => (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                  <div className="text-xs text-text-muted mb-1">{entry.date}</div>
                  <div className="text-sm text-foreground font-medium">{entry.event}</div>
                  <div className="text-xs text-accent mt-0.5">{entry.role}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </InViewSection>

      {/* ── SECTION: SKILLS ── */}
      <InViewSection className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What are your tools?
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-8 sm:mb-12 max-w-2xl">
              Skills, each linked to the evidence and projects that prove them.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-3"
          >
            {Object.entries(careerData.skills)
              .sort(([, a], [, b]) => {
                const order = { expert: 0, advanced: 1, high: 2, competent: 3 };
                return (order[a.level] ?? 99) - (order[b.level] ?? 99);
              })
              .map(([name, skill]) => (
                <motion.div
                  key={name}
                  variants={fadeUpItem}
                  className="border border-border rounded-xl p-4 bg-surface hover:border-border-light transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        skill.level === "expert"
                          ? "bg-mcp/10 text-mcp border border-mcp/20"
                          : skill.level === "advanced"
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "bg-surface-2 text-text-muted border border-border"
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">
                    {skill.evidence[0]}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skill.projects.map((p) => (
                      <span key={p} className="text-[10px] text-accent/80">
                        {careerData.projects.find((pr) => pr.id === p)?.name || p}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </InViewSection>

      {/* ── FOOTER ── */}
      <footer className="px-4 sm:px-6 py-8 sm:py-12 border-t border-border bg-surface/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-sm text-text-muted">
            Walid Slim · {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <a
              href={`mailto:${careerData.personal.email}`}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-accent transition-colors"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Email
            </a>
            <a
              href={`https://${careerData.personal.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-accent transition-colors"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> GitHub
            </a>
            <a
              href={`https://${careerData.personal.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-accent transition-colors"
            >
              <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> LinkedIn
            </a>
            <a
              href="/terminal"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-accent transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Terminal
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-accent transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Dashboard
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
