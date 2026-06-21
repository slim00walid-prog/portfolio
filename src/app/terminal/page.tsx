"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { careerData } from "@/data/career";
import { Terminal as TerminalIcon, Send, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Entry = {
  type: "input" | "output" | "error" | "system";
  text: string;
  tool?: string;
};

const WELCOME = `┌─────────────────────────────────────────────────────┐
│  Walid Slim — MCP Terminal Interface               │
│  Type 'help' for commands. 'exit' to leave.        │
│  This terminal calls the same MCP tools an AI      │
│  agent would use to interview my career.           │
└─────────────────────────────────────────────────────┘`;

const HELP_TEXT = `Available commands:
  about              — Who is Walid?
  projects           — List all projects
  project <id>       — Get project details (mcp-gateway, ai-concierge, mcp-apps, booking-engine, oauth-server, q-storage, kpi-analytics)
  skills             — List skills and competency levels
  skill <name>       — Get details about a specific skill
  stats              — Aggregate career statistics
  timeline           — Career timeline
  evidence <key>     — Look up a Jira issue
  decisions          — Design decisions across all projects
  tech-stack         — Technology breakdown
  ask <question>     — Ask anything about my career
  help               — Show this message
  clear              — Clear terminal
  exit               — Return to portfolio`;

function formatProject(project: (typeof careerData.projects)[0]) {
  return `${project.name}
  Role: ${project.role}
  ${project.tagline}
  Stack: ${project.stack.join(", ")}
  ${project.detailLevels.simple}
  Path: ${project.path}
  Evidence: ${project.evidence.length} issues`;
}

function formatSkill(name: string, skill: (typeof careerData.skills)[string]) {
  return `${name}  [${skill.level.toUpperCase()}]
  Projects: ${skill.projects.map((p) => careerData.projects.find((pr) => pr.id === p)?.name || p).join(", ")}
  ${skill.evidence.join("\n  ")}
  Jira issues: ${skill.jiraCount}`;
}

function formatStats() {
  const a = careerData.aggregate;
  return Object.entries(a)
    .map(([key, val]) => `  ${key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}: ${val}`)
    .join("\n");
}

function formatTimeline() {
  return careerData.timeline
    .map((t) => `  ${t.date}  ${t.event.padEnd(60)} ${t.role}`)
    .join("\n");
}

function formatDecisions() {
  return careerData.projects
    .filter((p) => p.decisions.length > 0)
    .flatMap((p) =>
      p.decisions.map(
        (d) =>
          `[${p.name}]\n  Problem: ${d.problem}\n  Decision: ${d.decision}\n  Trade-off: ${d.tradeoff}\n  Outcome: ${d.outcome}\n`
      )
    )
    .join("\n");
}

function formatTechStack() {
  const allStack = new Map<string, number>();
  careerData.projects.forEach((p) =>
    p.stack.forEach((t) => allStack.set(t, (allStack.get(t) || 0) + 1))
  );
  return [...allStack.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tech, count]) => `  ${tech.padEnd(25)} ${count} project${count > 1 ? "s" : ""}`)
    .join("\n");
}

function formatProjects() {
  return careerData.projects
    .map(
      (p) =>
        `  ${p.id.padEnd(20)} ${p.role.padEnd(18)} ${p.stack.length} tech`
    )
    .join("\n");
}

export default function TerminalPage() {
  const [entries, setEntries] = useState<Entry[]>([
    { type: "system", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollDown = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollDown, [entries]);

  const addOutput = useCallback(
    (entry: Entry) => {
      setEntries((prev) => [...prev, entry]);
    },
    []
  );

  const handleCommand = useCallback(
    async (cmdLine: string) => {
      const trimmed = cmdLine.trim();
      if (!trimmed) return;

      setHistory((prev) => [...prev.slice(-49), trimmed]);
      setHistoryIdx(-1);
      addOutput({ type: "input", text: `$ ${trimmed}` });

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch (cmd) {
        case "help":
          addOutput({ type: "output", text: HELP_TEXT });
          return;

        case "clear":
          setEntries([{ type: "system", text: WELCOME }]);
          return;

        case "about":
          try {
            setBusy(true);
            const res = await fetch("/api/mcp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tool: "about", args: {} }),
            });
            const data = await res.json();
            addOutput({
              type: "output",
              text: data?.result?.content?.[0]?.text || "No data",
              tool: "about",
            });
          } catch {
            addOutput({ type: "error", text: "Error: Could not reach MCP server" });
          } finally {
            setBusy(false);
          }
          return;

        case "projects":
          if (args[0]) {
            const project = careerData.projects.find((p) => p.id === args[0]);
            if (project) {
              addOutput({ type: "output", text: formatProject(project), tool: "get_project" });
            } else {
              addOutput({ type: "error", text: `Project '${args[0]}' not found. Try: ${careerData.projects.map((p) => p.id).join(", ")}` });
            }
          } else {
            addOutput({ type: "output", text: formatProjects(), tool: "list_projects" });
          }
          return;

        case "skills":
          if (args[0]) {
            const key = Object.keys(careerData.skills).find(
              (k) => k.toLowerCase() === args.join(" ").toLowerCase()
            );
            if (key) {
              addOutput({ type: "output", text: formatSkill(key, careerData.skills[key]), tool: "get_skill_dna" });
            } else {
              addOutput({ type: "error", text: `Skill '${args.join(" ")}' not found` });
            }
          } else {
            const list = Object.entries(careerData.skills)
              .sort(([, a], [, b]) => {
                const order = { expert: 0, advanced: 1, high: 2, competent: 3 };
                return (order[a.level] ?? 99) - (order[b.level] ?? 99);
              })
              .map(([name, s]) => `  ${name.padEnd(25)} ${s.level.toUpperCase().padEnd(10)} ${s.projects.length} project${s.projects.length > 1 ? "s" : ""}`)
              .join("\n");
            addOutput({ type: "output", text: list, tool: "get_skill_dna" });
          }
          return;

        case "stats":
          addOutput({ type: "output", text: formatStats(), tool: "get_aggregate_stats" });
          return;

        case "timeline":
          addOutput({ type: "output", text: formatTimeline(), tool: "get_timeline" });
          return;

        case "decisions":
          addOutput({ type: "output", text: formatDecisions(), tool: "get_engineering_decision" });
          return;

        case "tech-stack":
          addOutput({ type: "output", text: formatTechStack(), tool: "get_tech_stack_breakdown" });
          return;

        case "exit":
          addOutput({ type: "system", text: "Returning to portfolio..." });
          setTimeout(() => window.location.href = "/", 500);
          return;

        case "ask":
          if (args.length === 0) {
            addOutput({ type: "error", text: "Usage: ask <question>" });
            return;
          }
          try {
            setBusy(true);
            const res = await fetch("/api/mcp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tool: "ask", args: { question: args.join(" ") } }),
            });
            const data = await res.json();
            addOutput({
              type: "output",
              text: data?.result?.content?.[0]?.text || "No answer found.",
              tool: "ask",
            });
          } catch {
            addOutput({ type: "error", text: "Error: Could not reach MCP server" });
          } finally {
            setBusy(false);
          }
          return;

        case "evidence":
          if (args.length === 0) {
            addOutput({ type: "error", text: "Usage: evidence <key> (e.g. QT-14453)" });
            return;
          }
          try {
            setBusy(true);
            const res = await fetch("/api/mcp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tool: "get_evidence", args: { key: args[0].toUpperCase() } }),
            });
            const data = await res.json();
            addOutput({
              type: "output",
              text: data?.result?.content?.[0]?.text || "No evidence found.",
              tool: "get_evidence",
            });
          } catch {
            addOutput({ type: "error", text: "Error: Could not reach MCP server" });
          } finally {
            setBusy(false);
          }
          return;

        default:
          addOutput({ type: "error", text: `Unknown command: ${cmd}. Type 'help' for available commands.` });
      }
    },
    [addOutput]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (busy) return;
      handleCommand(input);
      setInput("");
    },
    [input, handleCommand, busy]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx === -1) return;
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    },
    [history, historyIdx]
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Terminal chrome bar */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#1a1a1a] border-b border-[#333]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-muted hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <TerminalIcon className="w-3 h-3" />
          walid-slim@portfolio — MCP Terminal
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEntries([{ type: "system", text: WELCOME }])}
            className="text-text-muted hover:text-foreground transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm" onClick={() => inputRef.current?.focus()}>
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`mb-1 whitespace-pre-wrap ${
              entry.type === "input"
                ? "text-mcp"
                : entry.type === "error"
                  ? "text-red-400"
                  : entry.type === "system"
                    ? "text-text-muted"
                    : "text-foreground/80"
            }`}
          >
            {entry.tool && (
              <span className="text-[10px] text-accent block mb-0.5">
                tool: {entry.tool}
              </span>
            )}
            {entry.text}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-text-muted mt-1">
            <span className="w-2 h-2 rounded-full bg-mcp animate-pulse" />
            Processing...
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Terminal input */}
      <form onSubmit={onSubmit} className="border-t border-[#333] p-3 flex items-center gap-2 bg-[#111]">
        <span className="text-mcp font-mono text-sm shrink-0">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-foreground font-mono text-sm outline-none placeholder:text-text-muted/40"
          autoFocus
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="text-text-muted hover:text-mcp transition-colors disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </main>
  );
}
