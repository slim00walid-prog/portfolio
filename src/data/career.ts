export interface Project {
  id: string;
  name: string;
  role: "Primary author" | "Key contributor" | "Solo build" | "Contributor";
  tagline: string;
  description: string;
  stack: string[];
  stats: Record<string, number | string>;
  type: "company" | "personal";
  path: string;
  architecture: {
    pattern: string;
    transport?: string;
    auth?: string;
    highlights: string[];
  };
  decisions: {
    id: string;
    problem: string;
    decision: string;
    tradeoff: string;
    outcome: string;
  }[];
  evidence: string[];
  detailLevels: {
    simple: string;
    detailed: string;
    architecture: string;
  };
}

export interface JiraIssue {
  key: string;
  summary: string;
  priority: "Highest" | "High" | "Medium" | "Low";
  theme: string;
  status: string;
}

export interface TimelineEntry {
  date: string;
  event: string;
  role: string;
}

export interface Skill {
  level: "expert" | "advanced" | "high" | "competent";
  evidence: string[];
  projects: string[];
  jiraCount: number;
}

export interface CareerData {
  personal: {
    name: string;
    title: string;
    location: string;
    email: string;
    github: string;
    linkedin: string;
    phone: string;
  };
  aggregate: Record<string, number>;
  projects: Project[];
  jiraThemes: Record<string, { count: number; keys: string[] }>;
  jiraIssues: JiraIssue[];
  skills: Record<string, Skill>;
  timeline: TimelineEntry[];
}

const PRODUCTION_EVIDENCE = [
  "QT-14453", "QT-14454", "QT-14303", "QT-14533", "QT-13579",
  "QT-14532", "QT-14646", "QT-14647", "QT-15336", "QT-15234",
  "QT-15434", "QT-15275", "QT-15273", "QT-15095", "QT-15187",
  "QT-15173", "QT-15172", "QT-15218", "QT-14648", "QT-14844",
  "QT-15517", "QT-15519", "QT-15520", "QT-15522", "QT-15523",
  "QT-15566", "QT-15087", "QT-14769", "QT-14756", "QT-14871",
  "QT-12570", "QT-12663", "QT-12611",
  "QT-12415", "QT-12412", "QT-13079", "QT-13068", "QT-12993",
  "QT-13741", "QT-13442", "QT-13812", "QT-13789", "QT-13500",
  "QT-15281", "QT-12712", "QT-12723", "QT-12725",
  "QT-12727", "QT-12728", "QT-12729", "QT-12730", "QT-12731",
  "QT-12735", "QT-12736", "QT-12737", "QT-12738", "QT-12739",
  "QT-12627", "QT-13137", "QT-13138", "QT-13251", "QT-13299",
  "QT-13359", "QT-13478", "QT-13486", "QT-13510", "QT-13723",
  "QT-13785", "QT-13787", "QT-13950", "QT-13952", "QT-14224",
  "QT-15523", "QT-11701", "QT-11702", "QT-10475",
  "QT-8523", "QT-8524", "QT-8525", "QT-8476", "QT-7681", "QT-7682",
  "QT-15173", "QT-15218", "QT-14648",
  "QT-8165", "QT-8383",
  "QT-9580", "QT-10569", "QT-10475", "QT-9690", "QT-10287",
];

export const careerData: CareerData = {
  personal: {
    name: "Walid Slim",
    title: "Senior Software Engineer — Backend & AI Systems",
    location: "Tunis, Tunisia",
    email: "slim00walid@gmail.com",
    github: "github.com/slim00walid-prog",
    linkedin: "linkedin.com/in/slim-walid",
    phone: "+216 99 443 555",
  },

  aggregate: {
    jiraIssuesCompleted: 508,
    jiraResolutionRate: 97,
    highestPriorityResolved: 53,
    bookingEngineIntegrations: 87,
    mcpServersBuilt: 7,
    aiToolsInProduction: 15,
    companyReposContributed: 16,
    personalProjects: 5,
    totalCommits: 1400,
    jiraMCPAIssues: 52,
    jiraBookingIssues: 117,
    highestPriority: 53,
    highPriority: 84,
    mediumPriority: 323,
    lowPriority: 24,
    mcpToolsShipped: 57,
    mcpProviders: 7,
  },

  projects: [
    {
      id: "mcp-gateway",
      name: "MCP Gateway",
      role: "Primary author",
      tagline: "Enterprise MCP gateway — 57 tools across 7 providers behind one endpoint.",
      description:
        "A NestJS-based MCP gateway that routes AI agent requests to multiple providers with OAuth 2.1 auth, scope-based permissions, CIDR IP validation, and audit logging. Every tool declares its own permission surface — scopes are generated, never hand-listed.",
      stack: ["NestJS 10", "MCP SDK", "MongoDB", "Redis", "OAuth 2.1", "JWT", "Zod", "Kubernetes"],
      stats: { tools: 57, providers: 7, commits: 676, contributors: 16, loc: "25K+" },
      type: "company",
      path: "/home/walid/qt/nestjs-mcp",
      architecture: {
        pattern: "Multi-provider MCP gateway with decorator-based tool framework",
        transport: "Streamable HTTP, SSE, stdio",
        auth: "OAuth 2.1 with JWT bearer + IP CIDR scopes",
        highlights: [
          "Decorator-based provider framework (@Tool, @Resource, @Prompt)",
          "Auto-generated per-tool scopes (read/write/readAll/writeAll)",
          "4 composable guards: JWT -> Scope -> CIDR IP -> Rate limit",
          "MongoDB-backed provider registry — rescoped with zero redeploys",
          "500-session pool with 3-tier inactivity cleanup",
        ],
      },
      decisions: [
        {
          id: "gateway-provider-registry",
          problem: "Tools changing per environment require code redeploys",
          decision: "Provider registry in MongoDB, not static config",
          tradeoff: "Operational flexibility vs cache invalidation complexity",
          outcome: "57 tools enable/disable/rescoped with zero redeploys",
        },
        {
          id: "gateway-scope-generation",
          problem: "Hand-listing scopes for 57 tools across 4 permission levels is error-prone",
          decision: "Scopes auto-generated from tool declarations (@Tool({ permissions: ['read', 'readAll'] }))",
          tradeoff: "Less flexibility for irregular permissions vs guarantees no scope is forgotten",
          outcome: "Zero scope-mismatch bugs since deployment",
        },
      ],
      evidence: [
        "QT-14453", "QT-14532", "QT-13579", "QT-15218", "QT-14648",
        "QT-15434", "QT-15275", "QT-15273", "QT-15095", "QT-15187",
        "QT-15173", "QT-15172", "QT-15234",
      ],
      detailLevels: {
        simple:
          "I built the gateway that lets AI agents like Claude talk to hotel systems securely. It checks who you are, what you're allowed to do, and routes your request to the right system — all in under 5ms.",
        detailed:
          "Built a NestJS MCP gateway handling 57 tools across 7 providers. OAuth 2.1 with Azure AD SSO, 4-tier guard chain (JWT → Scope → CIDR → Rate limit), MongoDB-backed provider registry. Supports Streamable HTTP, SSE, and stdio transports. 676 commits, 16 contributors.",
        architecture:
          "Decorator-based framework where @Tool({ permissions, schema }) auto-generates scopes and Zod validation. Provider[] registered in MongoDB with version-stamped cache invalidation. Guard composition via NestJS custom decorators. Session pooling with 3-tier cleanup (5min/1h/24h). Metrics via Datadog + structured logging.",
      },
    },
    {
      id: "ai-concierge",
      name: "AI Concierge Widget",
      role: "Primary author",
      tagline: "Embeddable AI concierge — hotels talk to guests through LLMs.",
      description:
        "A Next.js 15 embeddable widget that lets hotel guests book rooms, check weather, and discover nearby places through natural conversation. Orchestrates 15+ AI tools across Azure OpenAI, Google Gemini, with rolling memory summarization and Langfuse tracing.",
      stack: ["Next.js 15", "React 19", "AI SDK", "Azure OpenAI", "Google Gemini", "Redis", "MongoDB", "Langfuse", "Tailwind CSS"],
      stats: { tools: 15, hotels: "100+", commits: 118, contributors: 3 },
      type: "company",
      path: "/home/walid/qt/ai-chat-bot",
      architecture: {
        pattern: "Single-page embed -> Next.js streaming API -> 15+ AI tools",
        auth: "Guest session cookies (qt_guest_<appId>)",
        highlights: [
          "<500ms time-to-first-token via direct HTTP (no MCP cold-connect)",
          "Rolling GPT-4o-mini summarization — no vector DB needed",
          "RT outbox protocol with LPUSH/BRPOP for operator delivery",
          "appIds[] array stamps for multi-tenant partitioning",
          "50ms throttle + smoothStream('word') for 120fps UI",
        ],
      },
      decisions: [
        {
          id: "concierge-http-vs-mcp",
          problem: "AI widget needs sub-second responses; MCP SSE cold-connect costs 1000-1400ms",
          decision: "Direct HTTP tools, not MCP SDK, in the chat flow",
          tradeoff: "No MCP standardization vs 1s+ saved per request",
          outcome: "<500ms TTFT. MCP dep removed from chat flow entirely.",
        },
        {
          id: "concierge-rolling-summary",
          problem: "Bot needs memory across 15+ turn conversations without vector infrastructure",
          decision: "Rolling GPT-4o-mini summarization at 15-message threshold",
          tradeoff: "Compression loss vs embedding infra + retrieval misses",
          outcome: "Single Redis key per session replaces vector DB. ~1ms warm lookup.",
        },
      ],
      evidence: [
        "QT-15517", "QT-15519", "QT-15520", "QT-15522", "QT-15523", "QT-15566",
      ],
      detailLevels: {
        simple:
          "I built a smart chat widget for hotel websites. Guests can ask 'Book me a room for Friday' or 'What's the weather?' and the AI handles it, using tools I built for booking, weather, and nearby places.",
        detailed:
          "Full Next.js 15 widget with 15+ AI tools (booking, hotel info, weather, nearby, language). Server-side app classification (mono/central/specific), rolling GPT-4o-mini memory summarization, RT operator delivery via Redis outbox. Sub-5ms pre-stream latency warm. Single <script> embed on hotel sites.",
        architecture:
          "EmbedChat -> Chat (useChat, 50ms throttle) -> POST /api/chat/route.ts -> buildContext (Redis+Mongo) + getAppContext (server-side classification) -> buildToolRegistry (15 direct-HTTP tools) -> wrapToolRegistry (arg injection + scope) -> streamText (maxSteps:8, smoothStream, repairToolCall). Memory: rolling summary at 15msgs, Profile/Active hotel/Narrative/Open/Done sections. RT: LPUSH rt:outbox, worker BRPOP -> dedup via rt:sent:{messageId}.",
      },
    },
    {
      id: "mcp-apps",
      name: "MCP Apps Platform",
      role: "Primary author",
      tagline: "Interactive hotel apps inside Claude and ChatGPT.",
      description:
        "An Express + React 19 MCP server serving interactive hotel booking UIs (JALTA) and Nearby Places explorer via ui:// resources. Introduced the pattern where MCP tools return self-contained React widgets that render inside the AI client.",
      stack: ["Express", "React 19", "Vite", "MCP SDK", "MongoDB", "Redis", "Leaflet", "Apaleo PMS"],
      stats: { loc: "32K", apps: 3, commits: 83, contributors: 2 },
      type: "company",
      path: "/home/walid/qt/mcp-app",
      architecture: {
        pattern: "Streamable HTTP MCP server serving interactive React widgets via ui:// resources",
        transport: "Streamable HTTP",
        highlights: [
          "Interactive room picker, hotel carousel, and Nearby map rendered inside Claude/ChatGPT",
          "structuredContent vs _meta split — model sees semantics, widget sees pixels",
          "Apaleo PMS integration with OAuth2 token caching",
          "MongoDB hotel registry — new hotels onboarded with zero redeploys",
          "131 POI categories on OpenStreetMap with geohash Redis caching",
        ],
      },
      decisions: [
        {
          id: "apps-content-split",
          problem: "Room photos and map tiles in LLM context burn tokens and invite hallucination",
          decision: "Split structuredContent (model-visible) from widget data (display-only)",
          tradeoff: "Slightly more complex tool output vs 10x token savings on rendered content",
          outcome: "Clean reasoning, rich rendering, app-store compliance approved",
        },
      ],
      evidence: [
        "QT-15087", "QT-14769", "QT-14756", "QT-14871", "QT-15218",
      ],
      detailLevels: {
        simple:
          "I figured out how to put real hotel booking interfaces inside ChatGPT. When the AI wants to show rooms, instead of describing them in text, it renders a full room picker with photos and prices.",
        detailed:
          "Express + React 19 MCP server serving 3 apps via Streamable HTTP. Tools return ui:// resources that render React widgets (Vite single-file bundles) inside the AI client. PostMessage bridge for state sync. Apaleo PMS for live booking. 32K LOC.",
        architecture:
          "Streamable HTTP transport (custom, not standard SSE). Tool output split: { structuredContent: { offers }, _meta: { widgetData: { images, mapPins } } }. MongoHotelRegistry with zero-redeploy onboarding. Apaleo OAuth2 token caching with MCP session pooling. Geohash-based POI caching in Redis.",
      },
    },
    {
      id: "booking-engine",
      name: "Booking Engine Platform",
      role: "Primary author",
      tagline: "87+ hotel booking engines unified behind one API.",
      description:
        "NestJS microservice normalizing 87+ hotel booking providers behind one availability/booking API. ProviderFactory pattern with standard interface (getAvailability, bookRoom, checkStatus). UTM tracking on every request for GA4 attribution. Built the 3-transport MCP wrapper exposing it to AI agents.",
      stack: ["NestJS 10", "MCP SDK", "Axios", "Swagger", "class-validator", "xml2js", "Kubernetes"],
      stats: { providers: 87, providerDirs: 10, commits: 407, contributors: 10, mcpTransports: 3 },
      type: "company",
      path: "/home/walid/qt/be-service",
      architecture: {
        pattern: "ProviderFactory + MCP 3-transport wrapper",
        transport: "Streamable HTTP, SSE, stdio",
        highlights: [
          "ProviderFactory resolves correct BE at runtime by hotel config",
          "87+ providers across by-api/, by-url/, proprietary/, channels/",
          "UTM tracking + GA4 pixel events on every booking request",
          "3-transport MCP server exposes booking to AI agents",
          "Deployed to AKS via GitLab CI multi-stage Docker",
        ],
      },
      decisions: [
        {
          id: "be-provider-factory",
          problem: "Every hotel uses a different booking engine with a different API shape",
          decision: "ProviderFactory pattern with standard interface, resolved at runtime",
          tradeoff: "Upfront abstraction design vs duplicated per-provider integration logic",
          outcome: "New provider = implement 3 methods. 87+ integrated.",
        },
        {
          id: "be-mcp-transports",
          problem: "Different clients need different MCP transport modes",
          decision: "Support all 3 transports: Streamable HTTP (production), SSE (Claude Desktop), stdio (subprocess)",
          tradeoff: "3x transport code vs universal client compatibility",
          outcome: "Every client type supported from day one",
        },
      ],
      evidence: [
        "QT-12415", "QT-12412", "QT-12570", "QT-12611",
        "QT-13079", "QT-13068", "QT-12993", "QT-13741",
        "QT-13442", "QT-13812", "QT-15281",
      ],
      detailLevels: {
        simple:
          "I integrated 87+ different hotel booking systems so they all speak the same language. Whether a hotel uses Mirai, SynXis, or Mews — the AI can book rooms the same way.",
        detailed:
          "NestJS microservice with ProviderFactory pattern: 87+ providers across 10 directories. Each implements getAvailability/bookRoom/checkStatus. Built the 3-transport MCP wrapper (Streamable HTTP, SSE, stdio) for AI agent access. UTM tracking on every request. 407 commits.",
        architecture:
          "ProviderFactory: Map<providerId, IBookingProvider> resolved at runtime via hotel config. Providers in src/providers/{by-api,by-url,proprietary,channels}/. MCP layer in be-mcp-server: tools (available_rooms, book_room, check_room_status) over 3 transports. Deployed to AKS, GitLab CI, multi-stage Docker.",
      },
    },
    {
      id: "oauth-server",
      name: "MCP OAuth & SSO",
      role: "Primary author",
      tagline: "OAuth 2.0 for the MCP ecosystem.",
      description:
        "OAuth 2.0 authorization server for the entire MCP ecosystem. Azure AD SSO (corporate) and Google SSO (consumer). Full OAuth code flow with dynamic client registration (RFC 7591), PKCE, RS256 JWTs with JWKS publication, and OIDC discovery.",
      stack: ["Next.js 14", "NextAuth.js", "Ant Design", "Azure AD SSO", "Google SSO", "JWT"],
      stats: { ssoProviders: 2, oauthFlows: 3, scopeModel: 4 },
      type: "company",
      path: "/home/walid/qt/auth2/next-auth",
      architecture: {
        pattern: "OAuth 2.0 authorization server + token proxy for MCP gateway",
        auth: "Azure AD + Google SSO",
        highlights: [
          "Full OAuth code flow: authorize + token endpoints",
          "Azure AD SSO (corporate) + Google SSO (consumer)",
          "Token proxy: auth2 authenticates -> generates JWT -> nestjs-mcp validates",
          "12-scope MCP permission model (read/readAll/write/writeAll per tool group)",
          "Dynamic client registration via console UI",
        ],
      },
      decisions: [
        {
          id: "oauth-three-service",
          problem: "MCP tools need auth but the gateway shouldn't manage user identities",
          decision: "3-service chain: auth2 -> nestjs-mcp -> be-mcp-server, each owning one concern",
          tradeoff: "3 hops vs simpler 2-service chain",
          outcome: "Each layer has single responsibility. Token validates at every hop.",
        },
      ],
      evidence: [
        "QT-14453", "QT-14454", "QT-14533", "QT-13579", "QT-14303",
        "QT-14646", "QT-14647", "QT-15336", "QT-15234",
      ],
      detailLevels: {
        simple:
          "I built the login system for AI agents. Hotels can control exactly which tools each agent can use, and their team can log in with company credentials.",
        detailed:
          "OAuth 2.0 server with Azure AD + Google SSO for the MCP ecosystem. 12-scope permission model. 3-service auth chain (auth2 -> nestjs-mcp -> be-mcp-server). Dynamic client registration via console UI.",
        architecture:
          "auth2 (Next.js): /api/oauth/authorize + /api/oauth/token, NextAuth.js providers. -> nestjs-mcp: Passport JWT bearer guard, scope validation, IP CIDR check. -> be-mcp-server: token passthrough. RS256 JWKS published at /.well-known/jwks.json.",
      },
    },
    {
      id: "q-storage",
      name: "Q-Storage (Media Storage)",
      role: "Primary author",
      tagline: "S3-like file storage for thousands of hotel images.",
      description:
        "Complete file storage backend using NestJS, PostgreSQL, and Azure Blob Storage. Bucket management with per-team quotas, Sharp image processing pipeline, MD5 dedup, GIATA image distribution. Migrated thousands of existing hotel images from Q-Data.",
      stack: ["NestJS 10", "PostgreSQL", "TypeORM", "Azure Blob", "Sharp", "Multer", "JWT", "Bull"],
      stats: { commits: 283, contributors: 5, migrations: "All Q-Data images" },
      type: "company",
      path: "/home/walid/qt/media-storage-app",
      architecture: {
        pattern: "NestJS microservice with Azure Blob backend + PostgreSQL metadata",
        auth: "Passport JWT with role-based sub-bucket visibility",
        highlights: [
          "Bucket management with per-team storage quotas tracked in real-time",
          "Sharp image processing pipeline (resize, format conversion, thumbnails)",
          "MD5 hash dedup on upload",
          "GIATA image distribution endpoints",
          "Bull queue notifications to Q-Channel on image updates",
          "Perceptual image hashing for near-duplicate detection",
        ],
      },
      decisions: [
        {
          id: "storage-azure-blob",
          problem: "Hotel images need durable, scalable storage with access control",
          decision: "Azure Blob Storage for binary data + PostgreSQL (TypeORM) for metadata",
          tradeoff: "Two persistence layers vs simpler single-DB approach",
          outcome: "Blob handles scale (thousands of images), Postgres handles fast metadata queries (quotas, dedup, search)",
        },
      ],
      evidence: [
        "QT-12727", "QT-12728", "QT-12729", "QT-12730", "QT-12731",
        "QT-12735", "QT-12736", "QT-12737", "QT-12738", "QT-12739",
        "QT-12627", "QT-13137", "QT-13138", "QT-13251", "QT-13299",
        "QT-13359", "QT-13478", "QT-13486", "QT-13510", "QT-13723",
        "QT-13785", "QT-13787", "QT-13950", "QT-13952", "QT-14224",
      ],
      detailLevels: {
        simple:
          "I built the photo storage system for hotels. When a hotel uploads room photos, they're stored in Azure, checked for duplicates, and made available to all their properties. Like Google Photos for hotels.",
        detailed:
          "NestJS 10 + PostgreSQL (TypeORM) + Azure Blob Storage. Bucket management with quotas, Sharp image processing, MD5 dedup, GIATA endpoints, Bull queue notifications. Full migration from legacy Q-Data. 283 commits.",
        architecture:
          "TypeORM entities: Bucket {id, name, teamId, quotaBytes, usedBytes}, MediaFile {id, md5Hash, blobUrl, width, height, format, bucketId, subBucketId, uploadedBy, archived}. Azure Blob SDK for binary. Sharp for transforms. Bull queue for async notifications. 20+ Jira issues spanning full lifecycle.",
      },
    },
    {
      id: "kpi-analytics",
      name: "KPI Analytics Engine",
      role: "Contributor",
      tagline: "Hotel performance analytics with Elasticsearch + GA4.",
      description:
        "Analytics microservice processing hotel performance metrics through Elasticsearch, Bull job queues, jsreport PDF generation, and Google Analytics 4 integration. Tracks booking attribution, call-back events, and email pixel tracking.",
      stack: ["NestJS 7", "Elasticsearch", "Bull", "jsreport", "Chart.js", "Puppeteer", "Google APIs"],
      stats: { commits: 5455, contributors: 43, features: "Call-back tracking, PDF analytics, GA4" },
      type: "company",
      path: "/home/walid/qt/kpi",
      architecture: {
        pattern: "CQRS — MongoDB raw events -> Bull -> Elasticsearch analytics -> jsreport PDF",
        highlights: [
          "Email pixel tracking for campaign attribution",
          "GA4 direct-booking revenue tracking with currency exchange",
          "Queue-based async processing via Bull/Redis",
          "jsreport PDF generation with headless Chrome",
          "Mongo↔Elasticsearch reservation migrations",
        ],
      },
      decisions: [],
      evidence: [
        "QT-8523", "QT-8524", "QT-8525", "QT-8476", "QT-7681", "QT-7682",
      ],
      detailLevels: {
        simple:
          "I added tracking features to the analytics system — when a guest calls the hotel or opens a marketing email, it gets counted in the reports.",
        detailed:
          "NestJS 7 microservice with CQRS pattern. Bull queues for async processing, Elasticsearch for analytics queries, jsreport for PDF generation. Implemented call-back event tracking, GA4 revenue tracking with currency exchange, email pixel tracking for campaign attribution.",
        architecture:
          "Event -> MongoDB raw log -> Bull queue -> Elasticsearch index. Queries: Elasticsearch for aggregation, MongoDB for raw data. PDF: jsreport with headless Chrome rendering. GA4: Measurement Protocol with currency conversion via exchange-rate API. 89 commits by Walid.",
      },
    },
  ],

  jiraThemes: {
    "MCP / AI / Agent": {
      count: 52,
      keys: [
        "QT-14871", "QT-15519", "QT-15517", "QT-12570", "QT-14453",
        "QT-15087", "QT-14454", "QT-14844", "QT-14756", "QT-15050",
        "QT-15173", "QT-15275", "QT-14975", "QT-14942", "QT-15172",
        "QT-15434", "QT-14773", "QT-12663", "QT-14647", "QT-14926",
        "QT-14769", "QT-13579", "QT-15095", "QT-15218", "QT-12611",
        "QT-14646", "QT-12723", "QT-12725", "QT-15336", "QT-13500",
        "QT-12415", "QT-13789", "QT-13079", "QT-14532", "QT-13812",
        "QT-13442", "QT-15187", "QT-15566", "QT-12712", "QT-14648",
        "QT-14302", "QT-15276", "QT-13741", "QT-14303", "QT-15273",
        "QT-15221", "QT-12993", "QT-13068", "QT-15234",
      ],
    },
    "Booking Engine": {
      count: 60,
      keys: [
        "QT-11871", "QT-10266", "QT-6996", "QT-10569", "QT-15522",
        "QT-10697", "QT-9199", "QT-9200", "QT-9090", "QT-12663",
        "QT-10326", "QT-9690", "QT-12412", "QT-7481", "QT-12611",
        "QT-11832", "QT-10853", "QT-10490", "QT-10372", "QT-9828",
        "QT-15520", "QT-7967", "QT-7968", "QT-12415", "QT-10694",
        "QT-13079", "QT-10287", "QT-15061", "QT-11703", "QT-13812",
        "QT-13442", "QT-10535", "QT-9848", "QT-15281", "QT-14716",
        "QT-9580", "QT-6797", "QT-13741", "QT-8018", "QT-12570",
        "QT-7012", "QT-6819", "QT-15062", "QT-15108", "QT-7916",
        "QT-8025", "QT-7537", "QT-7177", "QT-10475", "QT-12176",
        "QT-6739", "QT-10537", "QT-12993", "QT-10002", "QT-7704",
        "QT-11983", "QT-13068", "QT-8555", "QT-7438", "QT-10134",
      ],
    },
    "Q-Storage": {
      count: 25,
      keys: [
        "QT-14224", "QT-13952", "QT-13950", "QT-13787", "QT-13785",
        "QT-13723", "QT-13510", "QT-13486", "QT-13478", "QT-13476",
        "QT-13359", "QT-13299", "QT-13251", "QT-13138", "QT-13137",
        "QT-12739", "QT-12738", "QT-12737", "QT-12736", "QT-12735",
        "QT-12731", "QT-12730", "QT-12729", "QT-12728", "QT-12727",
      ],
    },
    "OAuth / Auth": {
      count: 10,
      keys: [
        "QT-14453", "QT-14454", "QT-14303", "QT-14533", "QT-13579",
        "QT-9580", "QT-14646", "QT-14647", "QT-14302",
      ],
    },
  },

  jiraIssues: [],

  skills: {
    "MCP Protocol": {
      level: "expert",
      evidence: [
        "Built 7 MCP servers across production and personal projects",
        "Implemented 3 transport modes (Streamable HTTP, SSE, stdio)",
        "Designed OAuth 2.1 auth flow for MCP ecosystem",
        "Created decorator-based provider framework (nestjs-mcp-kit)",
        "Built interactive MCP Apps pattern with ui:// resources",
      ],
      projects: ["mcp-gateway", "mcp-apps", "booking-engine", "oauth-server"],
      jiraCount: 52,
    },
    NestJS: {
      level: "expert",
      evidence: [
        "8+ NestJS microservices built or contributed to",
        "ProviderFactory pattern for 87+ booking engine integrations",
        "Decorator-based MCP tool framework",
        "Modular architecture with DI, guards, interceptors, pipes",
      ],
      projects: ["mcp-gateway", "booking-engine", "q-storage"],
      jiraCount: 200,
    },
    TypeScript: {
      level: "expert",
      evidence: [
        "Primary language across ALL projects",
        "Strict mode everywhere, Zod for runtime validation",
        "Generic provider patterns, branded types, discriminated unions",
      ],
      projects: ["mcp-gateway", "ai-concierge", "booking-engine", "mcp-apps"],
      jiraCount: 500,
    },
    "React / Next.js": {
      level: "expert",
      evidence: [
        "Next.js 15 App Router for AI concierge widget",
        "React 19 with Server Components and streaming SSR",
        "Interactive MCP Apps widgets (room picker, carousel, map)",
      ],
      projects: ["ai-concierge", "mcp-apps", "oauth-server"],
      jiraCount: 28,
    },
    MongoDB: {
      level: "expert",
      evidence: [
        "Primary database across 8+ services",
        "Mongoose schema design with appIds[] multi-stamp pattern",
        "Provider registry with version-stamped cache invalidation",
        "Aggregation pipelines for analytics",
      ],
      projects: ["mcp-gateway", "ai-concierge"],
      jiraCount: 100,
    },
    Redis: {
      level: "expert",
      evidence: [
        "Session caching, rolling summaries, pub/sub",
        "RT outbox protocol with LPUSH/BRPOP",
        "Geohash-based POI caching",
        "Bull queue backend for async jobs",
      ],
      projects: ["ai-concierge", "mcp-gateway", "mcp-apps"],
      jiraCount: 30,
    },
    "OAuth 2.0": {
      level: "advanced",
      evidence: [
        "Built OAuth 2.0 authorization server for MCP ecosystem",
        "Azure AD SSO + Google SSO integration",
        "PKCE, RFC 7591 dynamic client registration, RS256 JWKS",
        "12-scope MCP permission model",
      ],
      projects: ["oauth-server", "mcp-gateway"],
      jiraCount: 10,
    },
    Docker: {
      level: "advanced",
      evidence: [
        "Multi-stage Docker builds for every service",
        "Production containers deployed to Azure AKS",
        "Local development with Docker Compose",
      ],
      projects: ["mcp-gateway", "booking-engine", "q-storage"],
      jiraCount: 1,
    },
    Kubernetes: {
      level: "advanced",
      evidence: [
        "Deployed MCP + Booking Engine services to AKS",
        "Helm charts, GitLab CI multi-stage pipelines",
        "Production management of 6+ services on K8s",
      ],
      projects: ["mcp-gateway", "booking-engine"],
      jiraCount: 1,
    },
    PostgreSQL: {
      level: "expert",
      evidence: [
        "TypeORM with PostgreSQL for media-storage-app",
        "Bucket quotas, MD5 dedup, file metadata",
      ],
      projects: ["q-storage"],
      jiraCount: 25,
    },
    "Real-time Systems": {
      level: "advanced",
      evidence: [
        "Socket.io for multi-channel messaging",
        "Bull queues for async job processing",
        "Redis pub/sub for cross-service events",
        "RT outbox protocol for idempotent delivery",
      ],
      projects: ["ai-concierge"],
      jiraCount: 15,
    },
    "Booking Engine Integration": {
      level: "expert",
      evidence: [
        "87+ hotel booking engine providers unified under one API",
        "ProviderFactory pattern with standard interface",
        "UTM tracking + GA4 attribution on every booking",
        "3-transport MCP wrapper for AI agent access",
      ],
      projects: ["booking-engine"],
      jiraCount: 117,
    },
  },

  timeline: [
    { date: "2023-03", event: "Joined Quicktext as Full-stack Developer", role: "Full-stack Developer" },
    { date: "2023-06", event: "First production contributions — bot-config, console V3 fixes", role: "Full-stack Developer" },
    { date: "2023-09", event: "Booking.com integrations, RT messaging features", role: "Full-stack Developer" },
    { date: "2024-01", event: "Owning booking engine service end-to-end", role: "Software Engineer" },
    { date: "2024-03", event: "Q-Storage project — built from scratch", role: "Software Engineer" },
    { date: "2024-06", event: "MCP platform research and initial gateway build", role: "Software Engineer" },
    { date: "2024-09", event: "K8s deployment of MCP + BE services", role: "Software Engineer" },
    { date: "2025-01", event: "MCP platform ownership — gateway, auth, apps", role: "Senior Software Engineer" },
    { date: "2025-03", event: "OAuth 2.0 server for MCP ecosystem delivered", role: "Senior Software Engineer" },
    { date: "2025-06", event: "AI concierge widget architecture and build", role: "Senior Software Engineer" },
    { date: "2025-09", event: "MCP Apps platform with interactive hotel UIs", role: "Senior Software Engineer" },
    { date: "2026-01", event: "57 tools across 7 providers behind MCP gateway", role: "Senior Software Engineer" },
    { date: "2026-06", event: "508 Jira issues completed, 21 repos contributed to", role: "Senior Software Engineer" },
  ],
};
