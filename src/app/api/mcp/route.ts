import { NextRequest, NextResponse } from "next/server";
import { toolDefinitions, handleToolCall } from "@/lib/mcp/tools";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { tool, args } = body;

    if (!tool) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32602, message: "Missing 'tool' in request body" },
        },
        { status: 400 }
      );
    }

    const toolDef = toolDefinitions.find((t) => t.name === tool);
    if (!toolDef) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Tool '${tool}' not found`,
            available: toolDefinitions.map((t) => t.name),
          },
        },
        { status: 404 }
      );
    }

    const result = await handleToolCall(tool, (args as Record<string, unknown>) || {});

    return NextResponse.json({
      jsonrpc: "2.0",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    server: {
      name: "walid-slim-portfolio",
      version: "2.0.0",
      description: "Don't read my portfolio. Interview it. — Walid Slim's career as MCP tools",
    },
    tools: toolDefinitions.map((t) => ({
      name: t.name,
      description: t.description,
    })),
    transport: "Streamable HTTP",
    connect: "claude mcp add walid-slim -- npx -y github:slim00walid-prog/portfolio",
  });
}
