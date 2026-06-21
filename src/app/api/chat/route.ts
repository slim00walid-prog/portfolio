import { streamText, smoothStream } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

const RESUME = `# WALID SLIM

**Senior Software Engineer — Backend & AI Systems**
Tunis, Tunisia

## PROFESSIONAL SUMMARY
Senior Software Engineer with 4 years designing and building production-grade AI systems, MCP infrastructure, and hotel booking platforms at scale. Architected an AI concierge widget serving 100+ hotels, built the MCP ecosystem across 7 servers connecting LLMs to 87+ booking engine APIs, and engineered a real-time messaging platform handling multi-channel guest communication. Deep expertise in TypeScript/Node.js, NestJS, Next.js, AI SDKs, microservices, and cloud-native deployment on Kubernetes.

## TECHNICAL SKILLS
Languages — TypeScript, JavaScript, Python (basic)
Backend — NestJS, Express, Node.js, REST APIs, WebSocket, gRPC
Frontend — React 19, Next.js 15, Tailwind CSS, Ant Design, MUI
AI & LLM — Vercel AI SDK, MCP Protocol, Azure OpenAI, Google Gemini, Langfuse
Databases — MongoDB (Mongoose), Redis, PostgreSQL (TypeORM), Elasticsearch
Infrastructure — Docker, Kubernetes (AKS), Azure, GitLab CI, Helm
Auth & Security — OAuth 2.0/2.1, JWT, NextAuth.js, Azure AD SSO, Google SSO
Messaging — Socket.io, Bull (Redis Queues), Twilio, Firebase Cloud Messaging
Observability — Datadog, Langfuse, structured logging

## WORK EXPERIENCE

### Quinta Hotel Software (Quicktext) | Senior Software Engineer
June 2023 — Present | Tunis, Tunisia

**AI Concierge Widget — Architecture & Build (from scratch)**
Architected and built the embeddable AI hotel concierge widget using Next.js 15, React 19, and Vercel AI SDK, serving 100+ hotels. Designed 15+ AI tools (booking, weather, nearby, hotel info) making direct HTTP calls — eliminating 1000-1400ms MCP cold-connect penalty and achieving <500ms time-to-first-token. Implemented rolling GPT-4o-mini summarization as the sole memory layer, replacing vector DB with a simpler stack that yields identical accuracy for 15-turn conversations.

**MCP Gateway (nestjs-mcp) — Key Contributor**
Co-built the enterprise MCP Gateway (676 commits, 16 contributors) providing a single endpoint routing to multiple providers (Weather, AvailPro, Aviio, Nearby). Implemented OAuth 2.0 Resource Server with IP validation, scope-based guards (Read/ReadAll/Write/WriteAll), and JWT authentication. Reduced MCP tool cold-start from 1.4s to near-zero by introducing Streamable HTTP transport alongside SSE and stdio.

**Booking Engine Platform (be-service + be-mcp-server) — Core Integration**
Integrated 87+ hotel booking engine providers into a unified NestJS microservice with a ProviderFactory pattern — each implementing a standard interface (getAvailability, bookRoom, checkStatus). Built the 3-transport MCP wrapper (Streamable HTTP, SSE, stdio) exposing booking tools to AI agents. Deployed both services to Kubernetes (Azure AKS) with GitLab CI multi-stage Docker builds.

**MCP OAuth & SSO (auth2/next-auth) — Build from scratch**
Built the OAuth 2.0 authorization server for the MCP ecosystem, supporting Azure AD SSO (corporate) and Google SSO (consumer). Implemented the full OAuth code flow (authorize/token endpoints), token proxy to the MCP gateway, and scope management UI for client credentials.

**Multi-App MCP Server (mcp-app) — Build from scratch**
Built a 32K-LOC MCP server with Streamable HTTP transport serving interactive hotel applications — JALTA booking (Apaleo PMS) and Nearby Places (Nominatim/OSM with Leaflet maps). Introduced the interactive widget pattern where MCP tools return ui:// resources that render rich React components in the LLM client.

**Real-Time Messaging (rt) — Feature Contributor**
Contributed to the core real-time messaging platform handling multi-channel communication across Web (Socket.io), WhatsApp (Twilio), SMS, Email, Firebase push, and Slack. Built HTML sanitizers for REST and WebSocket channels to prevent XSS in guest-bot conversations.

**Q-Storage (media-storage-app) — Build from scratch**
Architected a complete S3-like file storage backend using NestJS 10, PostgreSQL (TypeORM), and Azure Blob Storage. Delivered bucket management with per-team quota enforcement, Sharp image processing, MD5 dedup, GIATA image distribution, and Bull queue notifications.

**MCP Client (mcp-client) — Solo Build**
Built the NestJS MCP client bridging Azure OpenAI to MCP tool flows. Read/ReadAll permission scopes with Redis-cached tool responses.

**KPI Analytics (kpi) — Feature Contributor**
Contributed to the analytics microservice processing hotel performance metrics through Elasticsearch with Bull job queues and jsreport PDF generation.

## KEY ACHIEVEMENTS
- 507 Jira issues completed (97% resolution rate)
- 87+ hotel booking engine integrations unified
- 7 MCP servers built
- 15+ AI tools in production serving 100+ hotels
- 3 transport modes for MCP (Streamable HTTP, SSE, stdio)
- 16 company microservices contributed to
- 53 highest-priority production issues resolved
- 52 MCP / AI issues from research through deployment`;

const SYSTEM_PROMPT = `You are a career assistant for Walid Slim, a Senior Software Engineer. Answer questions about his career, skills, and experience based ONLY on the resume below.

Rules:
- Answer only based on the information provided in the resume.
- If asked about something not in the resume, say "That's not covered in my resume" and suggest what IS available.
- Keep answers concise and factual. Use bullet points when helpful.
- Do not make up experience, technologies, or roles that aren't listed.
- When asked about quantified impact, cite specific numbers from the resume.
- Be professional and direct — this is for a hiring manager audience.

Resume:
${RESUME}`;

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
  name: "groq",
});

function convertMessages(msgs: unknown[]): { role: "user" | "assistant"; content: string }[] {
  return (msgs || []).map((msg) => {
    const m = msg as Record<string, unknown>;
    let content = "";
    if (m.content && typeof m.content === "string") {
      content = m.content as string;
    } else if (m.parts && Array.isArray(m.parts)) {
      content = (m.parts as { text?: string }[])
        .map((p) => p.text || "")
        .join("");
    }
    return { role: m.role as "user" | "assistant", content };
  });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY not set. Add it to .env.local",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages = convertMessages(body.messages || []);

    const result = streamText({
      model: groq.chat("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 1024,
      temperature: 0.3,
      experimental_transform: smoothStream({
        delayInMs: 35,
        chunking: "word",
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
