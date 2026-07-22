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

Honestly, there's almost no app I use that wouldn't benefit from one. I will always prefer to have an agent do work for me instead of manually doing it myself.

Since I've joined Cloudflare, I've been building entirely on the platform. Turns out, adding an MCP server to an app using Cloudflare and the [Agents SDK](https://developers.cloudflare.com/agents/) is super easy. Let's see how!

This post walks through building one from scratch, using the same core structure I used for [DropCast](https://github.com/jamesqquick/demos/tree/main/podcast-summary-service), a podcast generator that exposes a single `generate_podcast` tool to any MCP client.

## What an MCP Server Actually Does

MCP (Model Context Protocol) is an open standard for connecting AI clients to external tools and data.

- **MCP Server** — your server that exposes tools (functions the AI can call)
- **MCP Client** — the thing connecting to your server (Claude Desktop, OpenCode, Cursor, etc.)
- **MCP Host** — the AI assistant or application that wraps the client

Your job as the server author is to define tools. A tool has a name, a description the model reads to decide when to call it, an input schema, and a handler function. The MCP protocol handles everything else like discovery, invocation, and results.

## How It Works on Cloudflare

On Cloudflare, an MCP server has two primary pieces: a [Worker](https://developers.cloudflare.com/workers/) and an `McpAgent` instance. The Worker is the entry point. The `McpAgent` is where and how you define your actual MCP server; it's tools, descriptions, etc.

The Worker acts as a traditional server allowing you to trigger a handler based on the route of an incoming request. In this case, it checks for the incoming URL of `/mcp` and forwards the traffic to the MCP agent. It looks like this.

```typescript
if (url.pathname === "/mcp") {
  return MyMCP.serve("/mcp").fetch(request, env, ctx);
}
```

`MyMCP` extends [`McpAgent`](https://developers.cloudflare.com/agents/), which is backed by a [Durable Object](https://developers.cloudflare.com/durable-objects/). A Durable Object is a single globally consistent instance with its own memory and optional SQL storage. Unlike a regular Worker which can spin up as many concurrent instances as needed, a Durable Object is guaranteed to be one instance. That makes it the right primitive for stateful sessions: each MCP client connection gets its own Durable Object, isolated from every other session.

The `init()` handler runs when a client connects. You register tools there and access your Worker [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) (`this.env.AI`, `this.env.DB`, etc.) the same way you would in any other Worker — but each binding needs to be declared in `wrangler.jsonc` first. The template includes the Durable Object binding out of the box; anything else, like [Workers AI](https://developers.cloudflare.com/workers-ai/configuration/bindings/), you add yourself.

```typescript
export class MyMCP extends McpAgent<Env> {
  server = new McpServer({ name: "my-tools", version: "1.0.0" });

  async init() {
    // register tools here
  }
}
```

With that in mind, the Cloudflare template scaffolds all of this for you. You start with a working server, then swap in your own tools.

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

With that in place, let's see how to build your own tool.

## Define Your First Tool

We'll build a `summarize_urls` tool that fetches a list of URLs and summarizes them using [Workers AI](https://www.cloudflare.com/products/workers-ai/). Let's build it up piece by piece.

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

The `inputSchema` field defines what arguments the tool accepts. In this case, we'll accept two parameters; an array of url strings, and an enum for the tone of the content we want generated. Use Zod to describe each parameter:

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

The `description` field is what the model reads to decide when and how to call this tool.

```typescript
this.server.registerTool(
  "summarize_urls",
  {
    description:
      "Fetch and summarize the content of 1 to 3 URLs using AI. Returns a combined summary.",
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

To trigger AI to build the summary, we'll use [Workers AI](https://developers.cloudflare.com/workers-ai/). To have acecss to this, we need to add the binding to `wrangler.jsonc` first:

```jsonc
{
  "ai": {
    "binding": "AI",
  },
}
```

Now `this.env.AI` is available inside your agent. We'll use a fairly naive approache to fetching url content but, overall, the tool will execute these steps:

- fetch the URLs
- build a prompt
- and run the model

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
};
```

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
        description:
          "Fetch and summarize the content of 1 to 3 URLs using AI. Returns a combined summary.",
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

## Deploy

Now, you can deploy:

```bash
npx wrangler deploy
```

Now that you'll be prompted to sign in if you aren't already.

Your server will now be live at `https://my-mcp-server.[your-account].workers.dev/mcp`.

## Connect to Claude Desktop

Update `claude_desktop_config.json` to point at your deployed server:

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://my-mcp-server.[your-account].workers.dev/mcp"
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

Deploy the updated handler, then set the secret.

```bash
npx wrangler deploy
wrangler secret put MCP_TOKEN
```

Pick any string as the value. `wrangler secret put` creates a new version of the Worker and deploys it immediately, so no additional deploy is needed after setting the secret. Then update your Claude Desktop config to pass it as a header:

```json
{
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://my-mcp-server.[your-account].workers.dev/mcp",
        "--header",
        "Authorization: Bearer your-token-here"
      ]
    }
  }
}
```

This is one shared secret, not per-user auth. It's a good starting point. You can add something more sophisticated later.

**Key takeaways:**

MCP servers are incredibly helpful in an AI world, and thankfully, they're incredibly easy to setup when using Cloudflare.

If you want to see this pattern in a real project, the full [DropCast source](https://github.com/jamesqquick/demos/tree/main/podcast-summary-service) is a good reference. It adds Cloudflare Workflows for long-running generation, R2 for audio storage, and D1-based user auth on top of the same `McpAgent` foundation.
