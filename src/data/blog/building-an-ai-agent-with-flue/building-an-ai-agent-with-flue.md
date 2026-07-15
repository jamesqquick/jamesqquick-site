---
title: "Building an AI Content Generation Agent with Flue"
coverImage: ./cover.png
pubDate: 2026-07-15T00:00:00.000Z
description: >-
  Flue is a TypeScript framework for building AI agents. Here's how to build one from
  scratch — defining how it thinks, what it does, and running it on Cloudflare Workers.
tags:
  - ai
  - cloudflare
  - typescript
---

Since it was announced initially, I've wanted to get hands-on with [Flue](https://flueframework.com), a TypeScript framework for building AI agents. I finally took the time and built something with it: an agent that takes a technical topic and writes a complete developer tutorial. It's a good project because it's simple enough to follow in one sitting but real enough to explore the core concepts of Flue.

This post walks through how I built it, explains those core concepts along the way, and how to deploy to Cloudflare.

## Setting up the project

Start by creating a directory and installing dependencies.

```bash
mkdir content-agent && cd content-agent
npm install @flue/runtime valibot 'agents@^0.14.2'
npm install --save-dev @flue/cli wrangler
npx flue init --target cloudflare
mkdir -p .flue/workflows .flue/skills/writer
```

`flue init` generates a `flue.config.ts` at the project root that sets the build target:

```typescript
import { defineConfig } from "@flue/cli/config";

export default defineConfig({
  target: "cloudflare",
});
```

`agents` is Cloudflare's Agents SDK. Flue uses this to leverage [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) which is what lets workflows run for minutes without timing out. Durable Objects are globally unique, durable, stateful, have attached SQlite storage, and can handle websockets. Normal Workers time out after 30 seconds. Durable Objects can run for hours.

Your structure should look like this:

```
content-agent/
  .flue/
    skills/
      writer/
    workflows/
  flue.config.ts
  package.json
```

## Configuring for Cloudflare

Create `wrangler.jsonc` at the project root:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "content-agent",
  "compatibility_date": "2026-06-01",
  "compatibility_flags": ["nodejs_compat"],
  "ai": {
    "binding": "AI",
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["FlueRegistry", "FlueGenerateWorkflow"],
    },
  ],
}
```

The `ai` binding gives your worker access to [Workers AI](https://www.cloudflare.com/products/workers-ai/) which gives you access to hosted LLM models like `kimi-k2.6` which we'll use in this demo.

The `migrations` block is how Cloudflare tracks Durable Object classes. `FlueRegistry` is internal to Flue, and `FlueGenerateWorkflow` maps to `workflows/generate.ts` (naming convention: `Flue` + PascalCase filename + `Workflow`). Every time you add a new workflow in the future, you append a new tagged entry here.

## Your first workflow

Create `.flue/workflows/generate.ts`. The simplest possible Flue workflow looks like this:

```typescript
import { defineAgent, defineWorkflow } from "@flue/runtime";

export default defineWorkflow({
  agent: defineAgent(() => ({
    model: "cloudflare/@cf/moonshotai/kimi-k2.6",
  })),
  async run({ harness }) {
    const session = await harness.session();
    const response = await session.prompt("Say hello");
    return { message: response.text };
  },
});
```

`defineWorkflow` is the container for the agent and its logic. `defineAgent` configures the model. `harness.session()` opens a conversation thread with the model, and `session.prompt()` sends a message and gets text back. That's a working agent.

The filename matters here. `generate.ts` maps to `POST /workflows/generate` and the Durable Object class `FlueGenerateWorkflow` — which is why you added both to `wrangler.jsonc` earlier.

## Accepting typed input and output

Right now the workflow ignores any input and always says hello. To make it useful, add `input` and `output` schemas. This is where [Valibot](https://valibot.dev) comes in — both schemas are Valibot objects that Flue uses to validate what callers send and what the workflow returns.

```typescript
import { defineAgent, defineWorkflow } from "@flue/runtime";
import * as v from "valibot";

export default defineWorkflow({
  agent: defineAgent(() => ({
    model: "cloudflare/@cf/moonshotai/kimi-k2.6",
  })),
  input: v.object({ topic: v.string() }),
  output: v.object({ tutorial: v.string() }),
  async run({ harness, input }) {
    const session = await harness.session();
    const response = await session.prompt(
      `Write a developer tutorial about: ${input.topic}`
    );
    return { tutorial: response.text };
  },
});
```

Now callers pass `{ topic: "..." }` and get back `{ tutorial: "..." }`. The agent still has no real identity or structure though — it'll write something, but it won't be consistent. That's next.

## Giving the agent an identity

Before giving the agent a specific task, you define its identity. Its values and operating principles that apply across every session it runs. In Flue, this goes in the `instructions` field on `defineAgent`. In your local workflow, you'd think of this as your `AGENTS.md` file.

For a tutorial-writing agent, I wanted to push against two potential pitfalls: sounding authoritative while being wrong, and padding content to seem thorough. These instructions help to address that.

```
You are content-agent, an AI that writes practical developer tutorials.
Never invent information you are not confident about.
Never write partial code snippets — every code block must be complete.
Write for developers who know the language but not this specific topic.
Explain why, not just what. Every code block deserves a sentence of context.
```

Notice it says nothing about tutorial structure or output format. Those belong in the skill, not the identity. Add it to `defineAgent`:

```typescript
agent: defineAgent(() => ({
  model: "cloudflare/@cf/moonshotai/kimi-k2.6",
  instructions: `You are content-agent, an AI that writes practical developer tutorials.
Never invent information you are not confident about.
Never write partial code snippets — every code block must be complete.
Write for developers who know the language but not this specific topic.
Explain why, not just what. Every code block deserves a sentence of context.`,
})),
```

## Creating a skill

The agent has an identity, but the inline prompt is still doing all the heavy lifting for structure and format. Skills solve this. A skill is a markdown file that gives the agent focused instructions for one specific task — what to produce, how to structure it, what format to return results in. They're reusable, separate from the agent's identity, and their output gets validated automatically.

A skill is a markdown file with frontmatter that Flue validates against the [Agent Skills spec](https://agentskills.io/specification). Create `.flue/skills/writer/SKILL.md`:

```markdown
---
name: writer
description: Writes a complete developer tutorial on a given topic.
---

# Writer Skill

You are writing a complete developer tutorial based on a topic description.

## Structure

1. Introduction — what the reader will build and why it matters (2–3 sentences)
2. Prerequisites — what the reader needs installed before starting
3. Numbered step sections — each step ends with something verifiable
4. Summary and next steps — brief recap and 2–3 things to explore further

## Rules

- Use TypeScript for all code examples.
- Every code block must be complete and runnable on its own.
- After every code block, write 1–3 sentences explaining what it does and why.
- Keep sections focused. Write the minimum needed to be clear and useful.

## Output format

Return a JSON object with exactly these two fields:

{
"title": "The tutorial title",
"tutorial": "The complete tutorial in markdown"
}
```

Two things to pay attention to: the `name` in frontmatter must exactly match the directory name (`writer`), and the output format section must match the Valibot schema you'll write in the workflow. Flue validates the model's response against that schema and retries if they don't match.

## Connecting the skill to the workflow

Import the skill using the `with { type: "skill" }` attribute — this tells the Flue CLI to bundle the markdown file as a skill reference at build time, not as a raw string:

```typescript
import writerSkill from "../skills/writer/SKILL.md" with { type: "skill" };
```

Add it to `defineAgent`'s `skills` array:

```typescript
agent: defineAgent(() => ({
  model: "cloudflare/@cf/moonshotai/kimi-k2.6",
  instructions: `...`,
  skills: [writerSkill],
})),
```

Then swap `session.prompt()` for `session.skill()`. Update the `output` schema to match the skill's output format — `title` and `tutorial`:

```typescript
async run({ harness, input }) {
  const session = await harness.session();

  const { data } = await session.skill("writer", {
    args: { topic: input.topic },
    result: v.object({ title: v.string(), tutorial: v.string() }),
  });

  if (!data) throw new Error("Writer returned no output");
  return data;
},
```

`session.skill("writer", ...)` sends the skill's instructions and your args to the model. The `result` schema validates the response. If the model returns something that doesn't match, Flue retries automatically. Whatever `run` returns gets stored in the run record and sent back to the caller.

## Exposing the workflow over HTTP

`route` and `runs` exports control HTTP access. `route` exposes the endpoint for triggering the workflow, and `runs` exposes the endpoint for inspecting a run's status and result. Without these exports, Flue keeps these endpoints private by default. HTTP is just one way to trigger a workflow — Flue also supports triggering via `invoke()` from application code, channels like Slack or GitHub, or the CLI during local development.

```typescript
export const route: WorkflowRouteHandler = async (_c, next) => next();
export const runs: WorkflowRunsHandler = async (_c, next) => next();
```

Here's the complete `generate.ts`:

```typescript
import {
  defineAgent,
  defineWorkflow,
  type WorkflowRouteHandler,
  type WorkflowRunsHandler,
} from "@flue/runtime";
import * as v from "valibot";
import writerSkill from "../skills/writer/SKILL.md" with { type: "skill" };

export const route: WorkflowRouteHandler = async (_c, next) => next();
export const runs: WorkflowRunsHandler = async (_c, next) => next();

export default defineWorkflow({
  agent: defineAgent(() => ({
    model: "cloudflare/@cf/moonshotai/kimi-k2.6",
    instructions: `You are content-agent, an AI that writes practical developer tutorials.
Never invent information you are not confident about.
Never write partial code snippets — every code block must be complete.
Write for developers who know the language but not this specific topic.
Explain why, not just what. Every code block deserves a sentence of context.`,
    skills: [writerSkill],
  })),
  input: v.object({ topic: v.string() }),
  output: v.object({ title: v.string(), tutorial: v.string() }),

  async run({ harness, input }) {
    const session = await harness.session();

    const { data } = await session.skill("writer", {
      args: { topic: input.topic },
      result: v.object({ title: v.string(), tutorial: v.string() }),
    });

    if (!data) throw new Error("Writer returned no output");
    return data;
  },
});
```

## Wiring up the app

Flue uses [Hono](https://hono.dev) as its HTTP server. This is optional, but we're creating it here to explicitly expose the two HTTP endpoints we need: one for triggering the workflow (`POST /workflows/generate`) and one for inspecting a run's status and result (`GET /runs/:runId`). `app.ts` is a standard Hono app with `flue()` mounted at the root:

```typescript
import { flue } from "@flue/runtime/routing";
import { Hono, type Hono as HonoApp } from "hono";

const app = new Hono();
app.get("/health", (c) => c.json({ ok: true }));
app.route("/", flue() as unknown as HonoApp);

export default app;
```

## Running it

Start the dev server by calling `flue dev`. The target is picked up automatically from `flue.config.ts` — no need to pass `--target cloudflare`.

```bash
npx flue dev
```

The first time you run this, Wrangler will prompt you to log in to your Cloudflare account. This is needed to access Workers AI locally. Follow the prompt to authenticate, then the dev server will start.

Send it a topic. The `?wait=result` parameter holds the connection open and returns the result directly:

```bash
curl -X POST "http://localhost:3583/workflows/generate?wait=result" \
  -H "Content-Type: application/json" \
  -d '{"topic": "How to use Cloudflare KV to cache API responses in a Worker"}'
```

This takes 30–90 seconds and returns a JSON object with `result.title` and `result.tutorial`. The `tutorial` field is a JSON-encoded string, so if you paste it directly into a markdown file it'll look like a mess.

To help with this, you can use `jq` as a command-line JSON tool to output a raw string without JSON encoding and pipe it to a markdown file for visibility. Install it with `brew install jq` if you don't have it. Then, use this updated command.

```bash
curl -X POST "http://localhost:3583/workflows/generate?wait=result" \
  -H "Content-Type: application/json" \
  -d '{"topic": "How to use Cloudflare KV to cache API responses in a Worker"}' \
  | jq -r '.result.tutorial' > tutorial.md
```

Read the output. If the tutorials feel generic, edit `SKILL.md` and retest. That's the whole iteration loop.

## Deploying

Build and deploy from the build output. Flue generates its own `wrangler.json` with merged bindings:

```bash
npx flue build
npx wrangler deploy --config dist/content_agent/wrangler.json
```

The `content_agent` in the path comes from the `name` field in your `wrangler.jsonc`. Note that Flue converts hyphens to underscores in the output directory name.

## What I'd add next

The agent as-is generates from existing model knowledge alone. The most impactful next step is giving it search functionality so the agent can read fresh documentation before writing. For topics involving specific APIs, the quality difference is significant.

Another option is to add an outline phase. A second `session.skill()` call that produces a structured outline before writing starts. The writer session gets the outline as an arg and stays focused on one section at a time instead of planning and writing in a single pass.

**Key takeaways:**

- Flue agents are built from four pieces: workflow, agent, session, and skills. Every agent is a combination of the same parts.
- Skills are `.md` files imported at build time with `with { type: 'skill' }`. The quality of the skill file is the biggest driver of output quality.
- The `instructions` field on `defineAgent` is the agent's identity. It applies across all sessions regardless of which skill runs.
- `?wait=result` on the workflow endpoint returns the result inline without polling.
