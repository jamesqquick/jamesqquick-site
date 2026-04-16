---
title: Register a Domain With Your AI Agent
slug: register-a-domain-with-your-ai-agent
coverImage: ./cover.jpg
pubDate: 2026-04-16T12:00:00.000Z
description: Use the Cloudflare Registrar API and MCP server to search, check, and register domains directly from your AI coding agent without leaving your editor.
tags:
  - cloudflare
  - ai
  - tools
---

You're mid-build, your agent just scaffolded a project, and you think of the perfect domain name. Normally that means opening a browser, navigating to a registrar, filling out forms, and killing your flow.

The Cloudflare Registrar API changes that.

P.S. If you're one of those people who already has too many domains. Walk away right now :D

## The Cloudflare Registrar API Is Now in Beta

Cloudflare just shipped the [Registrar API (beta)](https://blog.cloudflare.com/registrar-api-beta/), available through the Cloudflare MCP server. Connect it to your agent of choice (OpenCode, Cursor, Claude Code, whatever you use), and your agent can search for domains, check availability, and register them on your behalf from inside your editor.

## Connect the Cloudflare MCP

The Cloudflare MCP server exposes the full Cloudflare API surface, including the Registrar endpoints. Use the following MCP configuration:

```json
"cloudflare": {
  "type": "remote",
  "url": "https://mcp.cloudflare.com/mcp",
  "oauth": false,
  "enabled": true,
  "headers": {
    "Authorization": "Bearer {env:CLOUDFLARE_API_TOKEN}"
  }
},
```

You'll need:

- A **Cloudflare Account API token** with Registrar write permissions (set as an environment variable named CLOUDFLARE_API_TOKEN)
- A **billing profile** with a valid payment method
- A **default registrant contact** configured on your account

## How to Use It

As you're working on a project, you can say something like:

> "Find me a good .dev domain for this project and register it."

### Step 1: Search

First, the agent hits the search endpoint with your project context and gets back candidate names with pricing. Search is fast, but it's cached. It's good for discovery, but you'll need to fully verify the name is available.

### Step 2: Check Availability

Next, the agent calls the check endpoint to get real-time availability and pricing straight from the registry. If it comes back as available, the agent surfaces the confirmed price to you for approval.

### Step 3: Register

You say yes. The agent registers it, and uses your account's default contact and payment method automatically.

Happy hacking!
