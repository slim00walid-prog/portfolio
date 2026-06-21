"use client";

import { useEffect, useRef, useState } from "react";
import { careerData } from "@/data/career";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  Terminal,
  GitBranch,
  MessageCircle,
  HardDrive,
  Server,
  Bot,
  Key,
  Globe,
  Zap,
} from "lucide-react";

/* ──── Counter hook ──── */
function Counter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / (2000 / 16));
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else setCount(start);
          }, 16);
          observer.disconnect();
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center p-6 border border-border rounded-xl bg-surface hover:border-border-light transition-colors">
      <span className="block text-4xl md:text-5xl font-bold text-accent tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-sm text-text-muted mt-2 block">{label}</span>
    </div>
  );
}

/* ──── Bar chart ──── */
function BarChart({
  data,
  labelKey,
  valueKey,
  color = "accent",
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])));
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const v = Number(d[valueKey]);
        const pct = max > 0 ? (v / max) * 100 : 0;
        return (
          <div key={String(d[labelKey])} className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-40 shrink-0 truncate" title={String(d[labelKey])}>
              {String(d[labelKey])}
            </span>
            <div className="flex-1 h-5 bg-surface-2 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  color === "accent" ? "bg-accent" : "bg-mcp"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-text-muted w-12 text-right tabular-nums">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ pct, label }: { pct: number; label: string }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          className="transition-all duration-1000"
        />
        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
          className="text-lg font-bold fill-accent tabular-nums"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-text-muted text-center">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const a = careerData.aggregate;
  const themeData = Object.entries(careerData.jiraThemes)
    .map(([k, v]) => ({ theme: k, count: v.count }));

  const skillLevels = Object.entries(careerData.skills).map(([k, v]) => ({
    skill: k,
    level: v.level,
    jiraCount: v.jiraCount,
    projectCount: v.projects.length,
  }));

  const projectTechCounts = careerData.projects.map((p) => ({
    name: p.name,
    techs: p.stack.length,
    commits: Number(p.stats.commits) || 0,
  }));

  const topSkills = [...skillLevels].sort((a, b) => b.jiraCount - a.jiraCount).slice(5);

  return (
    <main className="min-h-screen bg-background">
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-surface/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-muted hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <Link href="/terminal" className="hover:text-accent transition-colors flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Terminal
          </Link>
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── Big counters row ── */}
        <section>
          <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
          <p className="text-text-muted mb-8">Numbers from Jira, Git, and source trees.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Counter target={a.jiraIssuesCompleted} suffix="+" label="Issues completed" />
            <Counter target={a.jiraResolutionRate} suffix="%" label="Resolution rate" />
            <Counter target={a.totalCommits} suffix="+" label="Commits" />
            <Counter target={a.companyReposContributed + a.personalProjects} suffix="" label="Repos" />
            <Counter target={a.mcpServersBuilt} suffix="" label="MCP servers" />
            <Counter target={a.bookingEngineIntegrations} suffix="+" label="BE integrations" />
            <Counter target={a.aiToolsInProduction} suffix="" label="AI tools in prod" />
            <Counter target={a.highestPriority} suffix="" label="Highest issues done" />
          </div>
        </section>

        {/* ── Priority donuts + theme bars ── */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="border border-border rounded-xl p-6 bg-surface">
            <h2 className="text-lg font-semibold text-foreground mb-6">Priority distribution</h2>
            <div className="grid grid-cols-2 gap-6">
              <Donut pct={Math.round((a.highestPriority / a.jiraIssuesCompleted) * 100)} label="Highest" />
              <Donut pct={Math.round((a.highPriority / a.jiraIssuesCompleted) * 100)} label="High" />
              <Donut pct={Math.round((a.mediumPriority / a.jiraIssuesCompleted) * 100)} label="Medium" />
              <Donut pct={Math.round((a.lowPriority / a.jiraIssuesCompleted) * 100)} label="Low" />
            </div>
          </div>

          <div className="border border-border rounded-xl p-6 bg-surface">
            <h2 className="text-lg font-semibold text-foreground mb-6">Jira themes</h2>
            <BarChart data={themeData} labelKey="theme" valueKey="count" />
          </div>
        </section>

        {/* ── Skills ranked ── */}
        <section className="border border-border rounded-xl p-6 bg-surface">
          <h2 className="text-lg font-semibold text-foreground mb-6">Skills by Jira volume</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
            {topSkills.map((s) => (
              <div key={s.skill} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.skill}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.level === "expert"
                        ? "bg-mcp/10 text-mcp"
                        : s.level === "advanced"
                          ? "bg-accent/10 text-accent"
                          : "bg-surface-2 text-text-muted"
                    }`}
                  >
                    {s.level}
                  </span>
                  <span className="text-xs text-text-muted tabular-nums w-10 text-right">{s.jiraCount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Project complexity ── */}
        <section className="border border-border rounded-xl p-6 bg-surface">
          <h2 className="text-lg font-semibold text-foreground mb-6">Project complexity</h2>
          <BarChart
            data={projectTechCounts}
            labelKey="name"
            valueKey="techs"
            color="#00ffaa"
          />
        </section>

        {/* ── Project quick links ── */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-6">Projects</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {careerData.projects.map((p) => (
              <Link
                key={p.id}
                href="/"
                className="border border-border rounded-xl p-4 bg-surface hover:border-accent transition-colors block"
              >
                <div className="flex items-center gap-2 mb-2">
                  {p.id === "mcp-gateway" ? <Server className="w-4 h-4 text-accent" /> :
                   p.id === "ai-concierge" ? <Bot className="w-4 h-4 text-accent" /> :
                   p.id === "mcp-apps" ? <Globe className="w-4 h-4 text-accent" /> :
                   p.id === "booking-engine" ? <Zap className="w-4 h-4 text-accent" /> :
                   p.id === "oauth-server" ? <Key className="w-4 h-4 text-accent" /> :
                   p.id === "q-storage" ? <HardDrive className="w-4 h-4 text-accent" /> :
                   <GitBranch className="w-4 h-4 text-accent" />}
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </div>
                <span className="text-[10px] text-text-muted">{p.stack.length} technologies</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-text-muted border-t border-border pt-8">
          <Link href="/terminal" className="hover:text-accent transition-colors inline-flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Interview via Terminal
          </Link>
        </footer>
      </div>
    </main>
  );
}
