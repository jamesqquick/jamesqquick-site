---
title: AI Automated Landing Page Reviews
slug: automate-landing-page-review-cloudflare-browser-run
pubDate: 2026-09-22T00:00:00.000Z
description: Build an Astro API that captures a landing page with Browser Run, grades its message with Workers AI, and caches the result in KV.
tags:
  - ai
  - cloudflare
  - astro
  - browser-run
coverImage: ./cover.png
---

<!-- Meta: Build an Astro API that captures a landing page with Cloudflare Browser Run, grades its message with Workers AI, and caches the result in KV. -->

Your landing page makes sense to you. You wrote it, but maybe your visitors don't get it, so I built a tool called [QuickGlance](https://quickglance.examples.workers.dev/) to test this.

You give it a URL and the number one desired takeaway you want visitors to have. It opens a real browser, extracts the page content, and asks an AI model to grade how well the page delivers your intended message.

Let's see how to build the API behind it with:

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Browser Run](https://developers.cloudflare.com/browser-run/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Workers KV](https://developers.cloudflare.com/kv/)

The tutorial stays focused on the API and does not cover the UI. Visit [QuickGlance](https://quickglance.examples.workers.dev/) to see the final result.

## Product Breakdown

Here's a quick overview of the technologies we'll use.

**Web API** - [Astro](https://astro.build/) endpoints

**Browser automation** - Cloudflare Browser Run extracts the website's content as Markdown.

**AI grading** - Workers AI uses the `@cf/meta/llama-3.3-70b-instruct-fp8-fast` model for inference.

**Caching** - Cloudflare KV stores each completed analysis for seven days.

## Requirements

Before starting, install [Node.js](https://nodejs.org/) 22.12 or later and [pnpm](https://pnpm.io/). You also need a Cloudflare account with Wrangler authenticated on your machine.

## Set Up the Project

Run the following command to create an Astro project configured for Cloudflare Workers. C3 runs Astro's project generator and adds the Cloudflare adapter and Wrangler configuration.

```bash
pnpm create cloudflare@latest quickglance --framework=astro
cd quickglance
```

## Create the KV Namespace

We'll cache completed reviews in Cloudflare KV. Create the namespace from the project directory with Wrangler. Authenticate Wrangler first if you have not already done so.

```bash
pnpm wrangler kv namespace create QUICKGLANCE_ANALYSES
```

Copy the namespace ID from the command output. We'll use it in the next step.

## Configure the Wrangler Bindings

A [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) makes a Cloudflare resource available to Worker code without putting API keys in your source.

Start by adding the Browser Run binding to `wrangler.jsonc`:

```json
"browser": {
  "binding": "BROWSER",
  "remote": true
}
```

The `BROWSER` name is the binding you'll access from Worker code. Setting `remote` to `true` lets local development call the hosted browser service.

Add the Workers AI binding next:

```json
"ai": {
  "binding": "AI",
  "remote": true
}
```

Finally, add the KV binding and replace the placeholder with the namespace ID returned by Wrangler:

```json
"kv_namespaces": [
  {
    "binding": "QUICKGLANCE_ANALYSES",
    "id": "<YOUR_KV_NAMESPACE_ID>"
  }
]
```

The final `wrangler.jsonc` should look similar to this. Keep the scaffold's existing values for `name`, `compatibility_date`, and `assets` if they differ.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "quickglance",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-09-16",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist",
  },
  "browser": {
    "binding": "BROWSER",
    "remote": true,
  },
  "ai": {
    "binding": "AI",
    "remote": true,
  },
  "kv_namespaces": [
    {
      "binding": "QUICKGLANCE_ANALYSES",
      "id": "<YOUR_KV_NAMESPACE_ID>",
    },
  ],
  "observability": {
    "enabled": true,
  },
}
```

Generate TypeScript types from the Wrangler configuration. Run this command from the project root; it creates `worker-configuration.d.ts` with the exact binding types for your project.

```bash
pnpm wrangler types
```

## Create the Analysis Endpoint

Create `src/pages/api/analyze.ts`. The first version establishes the API boundary. It expects `url` and `expectedTakeaway` in the POST body and returns them as JSON.

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

type AnalyzeRequest = {
  url: string;
  expectedTakeaway: string;
};

export const POST: APIRoute = async ({ request }) => {
  const { url, expectedTakeaway } = await request.json<AnalyzeRequest>();

  return Response.json({ url, expectedTakeaway });
};
```

Next, we'll replace this small handler with the complete analysis flow.

## Extract Site Content with Browser Run

[Browser Run](https://developers.cloudflare.com/browser-run/) is a hosted browser automation tool. Its Quick Actions include a dedicated `markdown` action for converting a page into Markdown.

Access the binding through `env.BROWSER`. Add this import near the top of the endpoint:

```typescript
import { env } from "cloudflare:workers";
```

Then add this call inside the `POST` handler to extract the page content:

```typescript
const response = await env.BROWSER.quickAction("markdown", {
  url,
});
const snapshot = await response.json();
const markdown = snapshot.result;
```

## Grade the Page with Workers AI

Now send the Markdown and expected takeaway to Workers AI. The model should return a letter grade and a short review.

Start with the AI binding:

```typescript
const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  // Add the messages and response format below.
});
```

Add the messages that describe the task and provide the captured page content:

```typescript
const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: [
    {
      role: "system",
      content:
        "Compare a landing page with its author's intended takeaway. Return a letter grade from A+ to F and specific feedback about the messaging.",
    },
    {
      role: "user",
      content: `Intended takeaway:\n${expectedTakeaway}\n\nLanding page:\n${markdown}`,
    },
  ],
});
```

Next, define a JSON schema for the response:

```typescript
const analysisSchema = {
  type: "object",
  properties: {
    review: { type: "string" },
    grade: { type: "string" },
  },
  required: ["review", "grade"],
};
```

Add `response_format` to the AI call so the model returns the shape we expect:

```typescript
const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: [
    {
      role: "system",
      content:
        "Compare a landing page with its author's intended takeaway. Return a letter grade from A+ to F and specific feedback about the messaging.",
    },
    {
      role: "user",
      content: `Intended takeaway:\n${expectedTakeaway}\n\nLanding page:\n${markdown}`,
    },
  ],
  response_format: {
    type: "json_schema",
    json_schema: analysisSchema,
  },
});
```

Return the review and grade from the endpoint:

```typescript
const review = result.response.review;
const grade = result.response.grade;

return Response.json({ review, grade });
```

### Complete Implementation

Replace `src/pages/api/analyze.ts` with this complete implementation:

```typescript
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

type AnalyzeRequest = {
  url: string;
  expectedTakeaway: string;
};

const analysisSchema = {
  type: "object",
  properties: {
    review: { type: "string" },
    grade: { type: "string" },
  },
  required: ["review", "grade"],
};

export const POST: APIRoute = async ({ request }) => {
  const { url, expectedTakeaway } = await request.json<AnalyzeRequest>();
  const response = await env.BROWSER.quickAction("markdown", { url });
  const snapshot = await response.json();
  const markdown = snapshot.result;

  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [
      {
        role: "system",
        content:
          "Compare a landing page with its author's intended takeaway. Return a letter grade from A+ to F and a short review of your findings.",
      },
      {
        role: "user",
        content: `Intended takeaway:\n${expectedTakeaway}\n\nLanding page:\n${markdown}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: analysisSchema,
    },
  });

  const review = result.response.review;
  const grade = result.response.grade;

  return Response.json({ review, grade });
};
```

## Test the API

Start the development server:

```bash
pnpm dev
```

Astro usually starts on port `4321`. Check the terminal output and use the actual port in the following cURL request:

```bash
curl --fail-with-body \
  --request POST http://localhost:4321/api/analyze \
  --header "content-type: application/json" \
  --data '{
    "url": "<URL>",
    "expectedTakeaway": "<TAKEAWAY>"
  }'
```

The response should look similar to this:

```json
{
  "review": "Your glowing review",
  "grade": "A"
}
```

## Cache Reviews with KV

AI requests cost more than a cache read, especially when this API is public. Rate limiting, authentication, and bot protection are useful production safeguards. This tutorial focuses on caching the review for a repeated URL and expected takeaway.

Create a deterministic ID from both input values:

```typescript
async function createAnalysisId(url: string, expectedTakeaway: string) {
  const input = new TextEncoder().encode(`${url}::${expectedTakeaway}`);
  const hash = await crypto.subtle.digest("SHA-256", input);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
```

Add the cache lookup after parsing the request:

```typescript
const { url, expectedTakeaway } = await request.json<AnalyzeRequest>();
const id = await createAnalysisId(url, expectedTakeaway);
const cached = await env.QUICKGLANCE_ANALYSES.get<AnalysisResult>(id, "json");

if (cached) return Response.json(cached);
```

After creating the analysis, save the same `{ review, grade }` shape that the endpoint returns:

```typescript
const analysis = { review, grade };

await env.QUICKGLANCE_ANALYSES.put(id, JSON.stringify(analysis), {
  expirationTtl: 60 * 60 * 24 * 7,
});

return Response.json(analysis);
```

### Complete Cached Implementation

Replace `src/pages/api/analyze.ts` with this complete version:

```typescript
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

type AnalyzeRequest = {
  url: string;
  expectedTakeaway: string;
};

type AnalysisResult = {
  review: string;
  grade: string;
};

const analysisSchema = {
  type: "object",
  properties: {
    review: { type: "string" },
    grade: { type: "string" },
  },
  required: ["review", "grade"],
};

export const POST: APIRoute = async ({ request }) => {
  const { url, expectedTakeaway } = await request.json<AnalyzeRequest>();
  const id = await createAnalysisId(url, expectedTakeaway);
  const cached = await env.QUICKGLANCE_ANALYSES.get<AnalysisResult>(id, "json");

  if (cached) {
    return Response.json(cached);
  }

  const response = await env.BROWSER.quickAction("markdown", { url });
  const snapshot = await response.json();
  const markdown = snapshot.result;

  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [
      {
        role: "system",
        content:
          "Compare a landing page with its author's intended takeaway. Return a letter grade from A+ to F and a short review of your findings.",
      },
      {
        role: "user",
        content: `Intended takeaway:\n${expectedTakeaway}\n\nLanding page:\n${markdown}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: analysisSchema,
    },
  });

  const analysis = {
    review: result.response.review,
    grade: result.response.grade,
  };

  await env.QUICKGLANCE_ANALYSES.put(id, JSON.stringify(analysis), {
    expirationTtl: 60 * 60 * 24 * 7,
  });

  return Response.json(analysis);
};

async function createAnalysisId(url: string, expectedTakeaway: string) {
  const input = new TextEncoder().encode(`${url}::${expectedTakeaway}`);
  const hash = await crypto.subtle.digest("SHA-256", input);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
```

## Test the Cache

Start the development server if it isn't already running. Send the same cURL request from earlier. The first request should take longer because it opens a browser and runs inference.

Run the same cURL request again. This time, the response should come from KV and return much faster.

## Wrap Up

For a production AI-powered app, there's more to add, including stronger input validation, SSRF protection, rate limiting, authentication, and bot protection. This example demonstrates how to combine Browser Run, Workers AI, and KV behind one Astro API endpoint.
