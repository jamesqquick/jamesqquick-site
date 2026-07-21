---
title: "Build an MCP Server on Cloudflare Workers"
slug: build-mcp-server-cloudflare-workers
pubDate: 2026-07-21T00:00:00.000Z
description: >-
  Create MCP servers with Cloudflare Workers and get built-in AI, Durable Objects for stateful sessions, and global deployment.
coverImage: ./cover.png
tags:
  - ai
  - cloudflare
  - typescript
  - mcp
---

Every app I've built recently has included an MCP server. Honestly, there's almost no app I use that wouldn't benefit from one. I will always prefer to have an agent do work for me instead of manually doing it myself.

Since I've joined Cloudflare, I've been building entirely on the platform. Turns out, adding an MCP server to an app using Cloudflare and the [Agents SDK](https://developers.cloudflare.com/agents/) is super easy. Let's see how! This post walks through building one from scratch, using the same core structure I used for [DropCast](https://github.com/jamesqquick/demos/tree/main/podcast-summary-service), a podcast generator that exposes a single `generate_podcast` tool to any MCP client.

## What an MCP Server Actually Does

MCP (Model Context Protocol) is an open standard for connecting AI clients to external tools and data.

- **MCP Server** — your server that exposes tools (functions the AI can call)
- **MCP Client** — the thing connecting to your server (Claude Desktop, OpenCode, Cursor, etc.)
- **MCP Host** — the AI assistant or application that wraps the client

Your job as the server author is to define tools. A tool has a name, a description the model reads to decide when to call it, an input schema, and a handler function. The MCP protocol handles everything else like discovery, invocation, and results.

## Scaffold the Project

Cloudflare has a template to get you started:

```bash
npm create cloudflare@latest -- my-mcp-server \
  --template=cloudflare/ai/demos/remote-mcp-authless
cd my-mcp-server
npm start
```

The template gives you a working MCP server immediately. You get two calculator tools (`add` and `calculate`) already registered, a fetch handler routing `/mcp` requests to the agent, and `wrangler.jsonc` pre-configured with the Durable Object binding and migration. You'll swap those example tools for your own.

The relevant files are:

```
src/
  index.ts    <- Worker entry point + MCP agent class
wrangler.jsonc
```

## The McpAgent Pattern

`McpAgent` from the Agents SDK is the core abstraction. Each MCP client session gets its own instance backed by a Durable Object, so you can store per-session state if you need it.

```typescript
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class MyMCP extends McpAgent<Env> {
  server = new McpServer({ name: "my-tools", version: "1.0.0" });

  async init() {
    // register tools here
  }
}
```

`init()` runs when a client connects. That's where you register tools.

## Define Your First Tool

We'll build a `summarize_urls` tool that fetches a list of URLs and summarizes them using Workers AI. Let's build it up piece by piece.

### Step 1: Register the tool

`registerTool()` takes a name, an options object, and a handler. Start with the bare minimum:

```typescript
async init() {
  this.server.registerTool(
    "summarize_urls",
    {},
    async () => ({
      content: [{ type: "text", text: "" }],
    })
  );
}
```

### Step 2: Add the input schema

The `inputSchema` field defines what arguments the tool accepts. Use Zod to describe each parameter:

```typescript
this.server.registerTool(
  "summarize_urls",
  {
    inputSchema: {
      urls: z.array(z.string().url()).min(1).max(3),
      tone: z.enum(["concise", "detailed"]).optional(),
    },
  },
  async ({ urls, tone }) => ({
    content: [{ type: "text", text: "" }],
  })
);
```

### Step 3: Add a description

The `description` field is what the model reads to decide when and how to call this tool. Be specific:

```typescript
this.server.registerTool(
  "summarize_urls",
  {
    description: "Fetch and summarize the content of 1 to 3 URLs using AI. Returns a combined summary.",
    inputSchema: {
      urls: z.array(z.string().url()).min(1).max(3),
      tone: z.enum(["concise", "detailed"]).optional(),
    },
  },
  async ({ urls, tone }) => ({
    content: [{ type: "text", text: "" }],
  })
);
```

### Step 4: Implement the handler

Now fill in the actual logic. Fetch the URLs, build a prompt, call Workers AI, and return the result:

```typescript
async ({ urls, tone }) => {
  const fetched = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      const text = await res.text();
      return { url, text: text.slice(0, 5000) }; // trim to stay within token limits
    })
  );

  const combined = fetched
    .map((f) => `URL: ${f.url}\n\n${f.text}`)
    .join("\n\n---\n\n");

  const prompt =
    tone === "detailed"
      ? `Summarize the following content in detail:\n\n${combined}`
      : `Write a concise summary of the following content:\n\n${combined}`;

  const result = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [{ role: "user", content: prompt }],
  });

  return {
    content: [
      { type: "text", text: result.response ?? "No summary generated." },
    ],
  };
}
```

`this.env.AI` is the Workers AI binding, available on every `McpAgent` instance just like any other Worker binding. No extra setup needed beyond declaring it in `wrangler.jsonc`.

### The full tool

Here's the complete `src/index.ts` with the tool wired in:

```typescript
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export class MyMCP extends McpAgent<Env> {
  server = new McpServer({ name: "my-tools", version: "1.0.0" });

  async init() {
    this.server.registerTool(
      "summarize_urls",
      {
        description: "Fetch and summarize the content of 1 to 3 URLs using AI. Returns a combined summary.",
        inputSchema: {
          urls: z
            .array(z.string().url())
            .min(1)
            .max(3)
            .describe("URLs to fetch and summarize"),
          tone: z
            .enum(["concise", "detailed"])
            .optional()
            .describe("How long the summary should be"),
        },
      },
      async ({ urls, tone }) => {
        const fetched = await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url);
            const text = await res.text();
            return { url, text: text.slice(0, 5000) };
          })
        );

        const combined = fetched
          .map((f) => `URL: ${f.url}\n\n${f.text}`)
          .join("\n\n---\n\n");

        const prompt =
          tone === "detailed"
            ? `Summarize the following content in detail:\n\n${combined}`
            : `Write a concise summary of the following content:\n\n${combined}`;

        const result = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [{ role: "user", content: prompt }],
        });

        return {
          content: [
            { type: "text", text: result.response ?? "No summary generated." },
          ],
        };
      }
    );
  }
}
```

## Wire Up the Entry Point

The entry point is a standard Workers fetch handler that routes `/mcp` requests to the agent. Add this below your `MyMCP` class in `src/index.ts`:

```typescript
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
```

The named export (`export class MyMCP`) is required so the Workers runtime can instantiate the Durable Object. The fetch handler owns the routing.

You also need to declare the AI and Durable Object bindings in `wrangler.jsonc`:

```jsonc
{
  "name": "my-mcp-server",
  "main": "src/index.ts",
  "compatibility_date": "2025-03-10",
  "compatibility_flags": ["nodejs_compat"],
  "ai": {
    "binding": "AI"
  },
  "durable_objects": {
    "bindings": [{ "name": "MCP_OBJECT", "class_name": "MyMCP" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["MyMCP"] }]
}
```

The `new_sqlite_classes` migration gives each agent instance its own built-in SQL storage.

## Test Locally

Start the dev server:

```bash
npm start
```

In a separate terminal, run the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector@latest
```

Open it at `http://localhost:5173`, enter your server URL (`http://localhost:8787/mcp`), and click Connect. You'll see your tools listed and can call them directly from the browser to verify everything works before deploying.

## Deploy and Connect to Claude

Deploy with one command:

```bash
npx wrangler deploy
```

Your server is now live at `https://my-mcp-server.your-account.workers.dev/mcp`.

To connect it to Claude Desktop, update `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://my-mcp-server.your-account.workers.dev/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop and your tools will show up. Ask Claude to summarize a few URLs and it will call `summarize_urls` on its own.

## Add Simple Token Auth

The server above is completely open. Anyone who knows the URL can call your tools. You don't need full OAuth to fix that. A shared Bearer token gets you from publicly accessible to private with minimal setup.

Update the fetch handler to check the token before routing to the agent:

```typescript
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      const auth = request.headers.get("Authorization") ?? "";
      if (auth !== `Bearer ${env.MCP_TOKEN}`) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

Set the secret through Wrangler. Never hardcode it:

```bash
wrangler secret put MCP_TOKEN
```

Pick any string as the value. Then update your Claude Desktop config to pass it as a header:

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://my-mcp-server.your-account.workers.dev/mcp",
        "--header",
        "Authorization: Bearer your-token-here"
      ]
    }
  }
}
```

This is one shared secret, not per-user auth. It's a good starting point. You can add OAuth later once you know what your access model actually needs to be. Cloudflare has a [workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) library built for exactly that.

---

**Key takeaways:**

- Tools are typed async functions. MCP handles how clients discover and invoke them.
- `McpAgent` gives each client session its own Durable Object, useful when you need state across tool calls in a session.
- A Bearer token gets you from open to private without building an OAuth flow.

If you want to see this pattern in a real project, the full [DropCast source](https://github.com/jamesqquick/demos/tree/main/podcast-summary-service) is a good reference. It adds Cloudflare Workflows for long-running generation, R2 for audio storage, and D1-based user auth on top of the same `McpAgent` foundation.
