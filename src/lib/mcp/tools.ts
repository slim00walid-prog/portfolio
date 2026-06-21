import { z } from "zod";
import { careerData } from "@/data/career";

export const toolDefinitions = [
  {
    name: "about",
    description: "Get Walid's bio, location, title, and contact information",
    inputSchema: z.object({}),
  },
  {
    name: "list_projects",
    description: "List all projects with role, stack, and metrics. Filter by type (company|personal)",
    inputSchema: z.object({
      filter: z.enum(["company", "personal"]).optional(),
    }),
  },
  {
    name: "get_project",
    description: "Deep dive on a specific project by ID. Returns architecture, decisions, evidence",
    inputSchema: z.object({
      id: z.string().describe("Project ID from list_projects"),
      depth: z.enum(["simple", "detailed", "architecture"]).optional().default("detailed"),
    }),
  },
  {
    name: "compare_projects",
    description: "Side-by-side comparison of two projects by ID",
    inputSchema: z.object({
      a: z.string(),
      b: z.string(),
    }),
  },
  {
    name: "get_evidence",
    description: "Query evidence by topic (e.g. 'oauth', 'mcp', 'booking', 'storage')",
    inputSchema: z.object({
      topic: z.string(),
    }),
  },
  {
    name: "get_skill_dna",
    description: "Full skill genome with proficiency levels and evidence for each skill",
    inputSchema: z.object({}),
  },
  {
    name: "get_skill_depth",
    description: "Evidence trail for one specific skill",
    inputSchema: z.object({
      skill: z.string(),
    }),
  },
  {
    name: "get_cv",
    description: "Generate an ATS-optimized CV. Optionally target a specific role for tailored content",
    inputSchema: z.object({
      targetRole: z.string().optional(),
    }),
  },
  {
    name: "get_aggregate_stats",
    description: "All quantified impact metrics with sources",
    inputSchema: z.object({}),
  },
  {
    name: "get_timeline",
    description: "Chronological career timeline with month granularity",
    inputSchema: z.object({}),
  },
  {
    name: "get_tech_stack_breakdown",
    description: "Language, framework, and tool distribution across all projects",
    inputSchema: z.object({}),
  },
  {
    name: "get_engineering_decision",
    description: "Specific design decision with trade-offs for a project",
    inputSchema: z.object({
      projectId: z.string(),
      decisionId: z.string(),
    }),
  },
  {
    name: "ask",
    description: "Semantic search across all career data. Ask any question about Walid's experience",
    inputSchema: z.object({
      question: z.string(),
    }),
  },
  {
    name: "contact",
    description: "Email, LinkedIn, GitHub, and phone",
    inputSchema: z.object({}),
  },
  {
    name: "get_jira_themes",
    description: "Jira issue counts grouped by theme (MCP, Booking, Storage, OAuth)",
    inputSchema: z.object({}),
  },
];

export type ToolName = (typeof toolDefinitions)[number]["name"];

const projectMap = new Map(careerData.projects.map((p) => [p.id, p]));

function simpleKeywordMatch(question: string): string {
  const q = question.toLowerCase();
  const results: string[] = [];

  if (q.includes("mcp") || q.includes("protocol")) {
    results.push("MCP work: 52 Jira issues, 7 MCP servers built (gateway, apps, booking, auth, client, personal projects).");
  }
  if (q.includes("oauth") || q.includes("auth") || q.includes("sso")) {
    results.push("OAuth: Built the auth server with Azure AD + Google SSO. 10 Jira issues. 3-service auth chain.");
  }
  if (q.includes("booking") || q.includes("engine")) {
    results.push(`Booking: 87+ provider integrations across 10 directories. ${careerData.jiraThemes["Booking Engine"]?.count || 60} Jira issues.`);
  }
  if (q.includes("nest") || q.includes("nestjs")) {
    results.push("NestJS: Expert level. 8+ microservices. Primary framework across MCP Gateway, BE Service, Q-Storage, and more.");
  }
  if (q.includes("react") || q.includes("next")) {
    results.push("React/Next.js: Built the AI concierge widget (Next.js 15), MCP Apps React widgets, OAuth server UI. 28 UI-related Jira issues.");
  }
  if (q.includes("docker") || q.includes("k8s") || q.includes("kubernetes")) {
    results.push("Deployed MCP + Booking Engine to Azure AKS (QT-12611). All 16 services have multi-stage Docker builds with GitLab CI.");
  }
  if (q.includes("storage") || q.includes("image") || q.includes("file")) {
    results.push("Q-Storage: Built S3-like file storage from scratch (NestJS + PostgreSQL + Azure Blob). 25+ Jira issues. Sharp image processing.");
  }
  if (q.includes("redis")) {
    results.push("Redis: Session caching, rolling summaries, RT outbox protocol (LPUSH/BRPOP), geohash POI caching, Bull queue backend.");
  }
  if (q.includes("typescript") || q.includes("ts")) {
    results.push("TypeScript is the primary language across ALL projects. Strict mode, Zod runtime validation, generics throughout.");
  }
  if (q.includes("senior") || q.includes("experience") || q.includes("years")) {
    results.push("3+ years at Quicktext (2023-present). Started as Full-stack Developer, promoted to Senior. Owned the entire MCP platform.");
  }
  if (q.includes("concierge") || q.includes("widget") || q.includes("chat") || q.includes("ai")) {
    results.push("AI Concierge: Built embeddable widget from scratch. 15+ tools, <500ms TTFT, rolling GPT-4o-mini summaries, multi-provider LLM routing.");
  }
  if (q.includes("quicktext") || q.includes("what did you build") || q.includes("what do you do") || q.includes("tell me about yourself") || q.includes("overview") || q.includes("summary")) {
    const a = careerData.aggregate;
    results.push(`At Quicktext (2023-present), I built the MCP platform that connects AI agents to hotel systems. Key projects:\n- MCP Gateway: 57 tools across 7 providers\n- AI Concierge Widget: embeddable chatbot for 100+ hotels\n- MCP Apps: interactive hotel UIs inside ChatGPT\n- Booking Engine: 87+ provider integrations unified\n- OAuth Server: Azure AD + Google SSO for MCP\n- Q-Storage: S3-like file storage from scratch\n\nQuantified: ${a.jiraIssuesCompleted} Jira issues (${a.jiraResolutionRate}% resolution), ${a.totalCommits}+ commits across ${a.companyReposContributed} company repos.`);
  }

  if (results.length === 0) {
    return `I couldn't find a direct match for "${question}". Try asking about: MCP, OAuth, booking engine, NestJS, React, Docker, K8s, Redis, storage, AI concierge, or typescript. Or use list_projects() to explore all projects.`;
  }

  return results.join("\n");
}

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: { type: string; text: string }[] }> {
  switch (name) {
    case "about": {
      const p = careerData.personal;
      return {
        content: [
          {
            type: "text",
            text: [
              `# ${p.name}`,
              `**${p.title}**`,
              `📍 ${p.location}`,
              ``,
              `📧 ${p.email}`,
              `🐙 ${p.github}`,
              `💼 ${p.linkedin}`,
              ``,
              careerData.projects
                .map(
                  (proj) =>
                    `- **${proj.name}** (${proj.role}): ${proj.tagline}`
                )
                .join("\n"),
            ].join("\n"),
          },
        ],
      };
    }

    case "list_projects": {
      const filter = args.filter as string | undefined;
      let projects = careerData.projects;
      if (filter) projects = projects.filter((p) => p.type === filter);

      return {
        content: [
          {
            type: "text",
            text: projects
              .map(
                (p) =>
                  `## ${p.name}\n**Role**: ${p.role}\n**Stack**: ${p.stack.join(", ")}\n**Tagline**: ${p.tagline}\n${
                    p.evidence.length > 0
                      ? `**Evidence**: ${p.evidence.slice(0, 5).join(", ")}${
                          p.evidence.length > 5 ? ` +${p.evidence.length - 5} more` : ""
                        }`
                      : ""
                  }\n`
              )
              .join("---\n"),
          },
        ],
      };
    }

    case "get_project": {
      const id = args.id as string;
      const depth = (args.depth as string) || "detailed";
      const project = projectMap.get(id);

      if (!project) {
        return {
          content: [
            {
              type: "text",
              text: `Project "${id}" not found. Available: ${careerData.projects.map((p) => p.id).join(", ")}`,
            },
          ],
        };
      }

      if (depth === "simple") {
        return {
          content: [
            {
              type: "text",
              text: `# ${project.name}\n${project.detailLevels.simple}\n\n**Stack**: ${project.stack.join(", ")}`,
            },
          ],
        };
      }

      if (depth === "architecture") {
        const arch = project.architecture;
        return {
          content: [
            {
              type: "text",
              text: [
                `# ${project.name} — Architecture`,
                `**Pattern**: ${arch.pattern}`,
                arch.transport ? `**Transport**: ${arch.transport}` : "",
                arch.auth ? `**Auth**: ${arch.auth}` : "",
                ``,
                "### Highlights",
                ...arch.highlights.map((h) => `- ${h}`),
                ``,
                project.detailLevels.architecture,
                ``,
                "### Design Decisions",
                ...project.decisions.map(
                  (d) =>
                    `#### ${d.id}\n- **Problem**: ${d.problem}\n- **Decision**: ${d.decision}\n- **Trade-off**: ${d.tradeoff}\n- **Outcome**: ${d.outcome}`
                ),
              ]
                .filter(Boolean)
                .join("\n"),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: [
              `# ${project.name}`,
              `**Role**: ${project.role}`,
              `**Stack**: ${project.stack.join(", ")}`,
              ``,
              project.detailLevels.detailed,
              ``,
              "### Evidence",
              ...project.evidence.map((e) => `- ${e}`),
              ``,
              "### Metrics",
              ...Object.entries(project.stats).map(([k, v]) => `- ${k}: ${v}`),
            ].join("\n"),
          },
        ],
      };
    }

    case "compare_projects": {
      const a = projectMap.get(args.a as string);
      const b = projectMap.get(args.b as string);

      if (!a || !b) {
        return {
          content: [
            {
              type: "text",
              text: `Not found. Available: ${careerData.projects.map((p) => p.id).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: [
              `| | **${a.name}** | **${b.name}** |`,
              `|---|---|---|`,
              `| Role | ${a.role} | ${b.role} |`,
              `| Stack | ${a.stack.slice(0, 4).join(", ")}... | ${b.stack.slice(0, 4).join(", ")}... |`,
              `| Type | ${a.type} | ${b.type} |`,
              `| Evidence | ${a.evidence.length} issues | ${b.evidence.length} issues |`,
              `| Decisions | ${a.decisions.length} | ${b.decisions.length} |`,
              ``,
              `**${a.name}**: ${a.tagline}`,
              `**${b.name}**: ${b.tagline}`,
            ].join("\n"),
          },
        ],
      };
    }

    case "get_evidence": {
      const topic = (args.topic as string).toLowerCase();
      const results: { project: string; evidence: string[] }[] = [];

      for (const project of careerData.projects) {
        const matching = project.evidence.filter((e) =>
          e.toLowerCase().includes(topic)
        );
        if (matching.length > 0) {
          results.push({ project: project.name, evidence: matching });
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No evidence found for "${topic}". Try: oauth, mcp, storage, booking, deploy, widget, kpi.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: [
              `# Evidence for "${topic}"`,
              ``,
              ...results.map(
                (r) =>
                  `## ${r.project}\n${r.evidence.map((e) => `- ${e}`).join("\n")}`
              ),
              ``,
              "### Theme totals from Jira",
              ...Object.entries(careerData.jiraThemes)
                .filter(([name]) => name.toLowerCase().includes(topic))
                .map(([name, data]) => `- **${name}**: ${data.count} issues`),
            ].join("\n"),
          },
        ],
      };
    }

    case "get_skill_dna": {
      return {
        content: [
          {
            type: "text",
            text: [
              "# Skill DNA",
              "",
              ...Object.entries(careerData.skills)
                .sort(([, a], [, b]) => {
                  const order = { expert: 0, advanced: 1, high: 2, competent: 3 };
                  return (order[a.level] ?? 99) - (order[b.level] ?? 99);
                })
                .map(
                  ([name, skill]) =>
                    `## ${name} (${skill.level.toUpperCase()})\n${skill.evidence
                      .map((e) => `- ${e}`)
                      .join("\n")}\n*Projects: ${skill.projects
                      .map((p) => projectMap.get(p)?.name || p)
                      .join(", ")}*\n*Jira issues: ${skill.jiraCount}*`
                ),
            ].join("\n\n"),
          },
        ],
      };
    }

    case "get_skill_depth": {
      const skillName = (args.skill as string).toLowerCase();
      const entry = Object.entries(careerData.skills).find(
        ([name]) => name.toLowerCase() === skillName
      );

      if (!entry) {
        return {
          content: [
            {
              type: "text",
              text: `Skill "${args.skill}" not found. Available: ${Object.keys(careerData.skills).join(", ")}`,
            },
          ],
        };
      }

      const [name, skill] = entry;
      return {
        content: [
          {
            type: "text",
            text: [
              `# ${name}`,
              `**Level**: ${skill.level.toUpperCase()}`,
              `**Jira issues**: ${skill.jiraCount}`,
              ``,
              "### Evidence",
              ...skill.evidence.map((e) => `- ${e}`),
              ``,
              "### Used in projects",
              ...skill.projects.map((p) => {
                const proj = projectMap.get(p);
                return proj ? `- **${proj.name}** (${proj.role}): ${proj.tagline}` : `- ${p}`;
              }),
            ].join("\n"),
          },
        ],
      };
    }

    case "get_cv": {
      const targetRole = args.targetRole as string | undefined;
      const p = careerData.personal;
      const topSkills = Object.entries(careerData.skills)
        .filter(([, s]) => s.level === "expert" || s.level === "advanced")
        .map(([name]) => name);

      return {
        content: [
          {
            type: "text",
            text: [
              `# ${p.name}`,
              `**${p.title}**`,
              `${p.location} · ${p.email} · ${p.github} · ${p.linkedin}`,
              ``,
              targetRole ? `> CV optimized for: **${targetRole}**\n` : "",
              "## Professional Summary",
              "Senior Software Engineer with 3+ years designing and building production-grade AI systems, MCP infrastructure, and hotel booking platforms at scale. Architected an AI concierge widget serving 100+ hotels, built the MCP ecosystem across 7 servers connecting LLMs to 87+ booking engine APIs.",
              "",
              "## Technical Skills",
              topSkills.join(" · "),
              "",
              "## Key Projects",
              ...careerData.projects.slice(0, 4).map(
                (proj) =>
                  `**${proj.name}** (${proj.role})\n${proj.detailLevels.detailed}`
              ),
              "",
              "## Quantified Impact",
              `- ${careerData.aggregate.jiraIssuesCompleted} Jira issues completed (${careerData.aggregate.jiraResolutionRate}% resolution rate)`,
              `- ${careerData.aggregate.bookingEngineIntegrations}+ booking engine integrations`,
              `- ${careerData.aggregate.mcpServersBuilt} MCP servers built`,
              `- ${careerData.aggregate.aiToolsInProduction} AI tools in production`,
              `- ${careerData.aggregate.highestPriorityResolved} highest-priority production issues resolved`,
            ].join("\n"),
          },
        ],
      };
    }

    case "get_aggregate_stats": {
      return {
        content: [
          {
            type: "text",
            text: [
              "# Aggregate Stats",
              ...Object.entries(careerData.aggregate).map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase());
                return `- **${label}**: ${value}`;
              }),
            ].join("\n"),
          },
        ],
      };
    }

    case "get_timeline": {
      return {
        content: [
          {
            type: "text",
            text: [
              "# Career Timeline",
              "",
              ...careerData.timeline.map(
                (t) => `**${t.date}** — ${t.event} _(role: ${t.role})_`
              ),
            ].join("\n"),
          },
        ],
      };
    }

    case "get_tech_stack_breakdown": {
      const allStack = careerData.projects.flatMap((p) => p.stack);
      const counts = new Map<string, number>();
      for (const s of allStack) {
        counts.set(s, (counts.get(s) || 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

      return {
        content: [
          {
            type: "text",
            text: [
              "# Tech Stack Breakdown",
              "",
              "### By usage across projects",
              ...sorted.map(([name, count]) => {
                const bar = "█".repeat(count);
                return `- ${name.padEnd(25)} ${bar} ${count}x`;
              }),
              "",
              "### Languages",
              "TypeScript — primary across ALL projects (16 company repos + 5 personal)",
              "JavaScript — legacy services",
              "",
              "### Databases",
              "MongoDB — 8+ services | Redis — caching, sessions, pub/sub | PostgreSQL — Q-Storage | Elasticsearch — KPI analytics",
            ].join("\n"),
          },
        ],
      };
    }

    case "get_engineering_decision": {
      const projectId = args.projectId as string;
      const decisionId = args.decisionId as string;
      const project = projectMap.get(projectId);

      if (!project) {
        return {
          content: [
            {
              type: "text",
              text: `Project "${projectId}" not found.`,
            },
          ],
        };
      }

      const decision = project.decisions.find((d) => d.id === decisionId);
      if (!decision) {
        return {
          content: [
            {
              type: "text",
              text: `Decision "${decisionId}" not found in ${project.name}. Available: ${project.decisions.map((d) => d.id).join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: [
              `# ${decision.id}`,
              `**Project**: ${project.name}`,
              ``,
              `**Problem**: ${decision.problem}`,
              `**Decision**: ${decision.decision}`,
              `**Trade-off**: ${decision.tradeoff}`,
              `**Outcome**: ${decision.outcome}`,
            ].join("\n"),
          },
        ],
      };
    }

    case "ask": {
      const question = args.question as string;
      return {
        content: [
          {
            type: "text",
            text: simpleKeywordMatch(question),
          },
        ],
      };
    }

    case "contact": {
      const p = careerData.personal;
      return {
        content: [
          {
            type: "text",
            text: `📧 ${p.email}\n🐙 ${p.github}\n💼 ${p.linkedin}\n📞 ${p.phone}\n📍 ${p.location}`,
          },
        ],
      };
    }

    case "get_jira_themes": {
      return {
        content: [
          {
            type: "text",
            text: [
              "# Jira Themes",
              "",
              ...Object.entries(careerData.jiraThemes)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(
                  ([theme, data]) =>
                    `## ${theme} (${data.count} issues)\n${data.keys.join(", ")}`
                ),
              "",
              `**Total issues tracked**: ${careerData.aggregate.jiraIssuesCompleted} (${careerData.aggregate.jiraResolutionRate}% resolution rate)`,
            ].join("\n"),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool "${name}". Available: ${toolDefinitions.map((t) => t.name).join(", ")}`,
          },
        ],
      };
  }
}
