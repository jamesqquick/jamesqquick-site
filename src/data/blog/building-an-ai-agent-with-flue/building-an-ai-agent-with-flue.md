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

## How Flue thinks about agents

Before writing any code, it's worth understanding the four pieces Flue is built around.

A **workflow** is a finite operation that takes input, does work, and returns a result. Every workflow wraps an **agent**: the model configuration. When the workflow runs, it creates a **session**, a conversation thread with the model where the actual work happens.

Within a session, you use **skills** to give the agent focused task instructions. A skill is a markdown file that tells the agent what to do for one kind of request; what to produce, how to format the output, what rules to follow. You import skills at build time and register them on the agent. The session calls a skill by name, the model follows its instructions, and you get back typed, validated output.

Every agent you build will use some combination of these parts; workflow, agent, session, and skill.

## Setting up the project

Start by creating a directory and installing dependencies.

```bash
mkdir content-agent && cd content-agent
npm install @flue/runtime valibot 'agents@^0.14.2'
npm install --save-dev @flue/cli wrangler
npx flue init --target cloudflare
mkdir -p .flue/workflows .flue/skills/writer
```

`agents` is Cloudflare's Agents SDK. Flue uses this to leverage Cloudflare Durable Object which is what lets workflows run for minutes without timing out. Normal Workers time out after 30 seconds. Durable Objects can run for hours.

Your structure should look like this:

```
content-agent/
  .flue/
    app.ts
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

## Defining how the agent thinks

Before giving the agent a specific task, you define its identity. Its values and operating principles that apply across every session it runs. In Flue, this goes in the `instructions` field on `defineAgent`. In your local workflow, you'd think of this as your `AGENTS.md` file.

For a tutorial-writing agent, I wanted to push against two potential pitfalls: sounding authoritative while being wrong, and padding content to seem thorough. These instructions help to address that.

```
You are content-agent, an AI that writes practical developer tutorials.
Never invent information you are not confident about.
Never write partial code snippets — every code block must be complete.
Write for developers who know the language but not this specific topic.
Explain why, not just what. Every code block deserves a sentence of context.
```

This lives in a `defineAgent` call, which you'll see in a moment. Notice it says nothing about tutorial structure or output format. Those belong in the skill, not the identity.

## Writing the skill

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

## Building the workflow

Create `.flue/workflows/generate.ts`. The first thing to add are the `route` and `runs` exports. `route` exposes the HTTP endpoint for triggering the workflow, and `runs` exposes the endpoint for inspecting a run's status and result. Without these exports, neither endpoint exists — Flue keeps them private by default.

```typescript
import {
  type WorkflowRouteHandler,
  type WorkflowRunsHandler,
} from "@flue/runtime";

export const route: WorkflowRouteHandler = async (_c, next) => next();
export const runs: WorkflowRunsHandler = async (_c, next) => next();
```

Next, import the skill and set up the workflow skeleton. The `with { type: "skill" }` import attribute tells the Flue CLI to bundle the markdown file as a skill reference at build time — not as a raw string.

```typescript
import { defineAgent, defineWorkflow } from "@flue/runtime";
import * as v from "valibot";
import writerSkill from "../skills/writer/SKILL.md" with { type: "skill" };

export default defineWorkflow({
  agent: defineAgent(() => ({
    // agent config goes here
  })),
  input: v.object({ topic: v.string() }),
  output: v.object({ title: v.string(), tutorial: v.string() }),

  async run({ harness, input }) {
    // run logic goes here
  },
});
```

`defineWorkflow` takes three things: an agent, an `input` schema that validates what callers send, and an `output` schema that validates what `run` returns. Both schemas use Valibot — the output schema here matches the shape defined in the skill's output format section.

Now fill in the agent. `defineAgent` takes a model identifier, the instructions you defined earlier, and the skills to make available:

```typescript
agent: defineAgent(() => ({
  model: "cloudflare/@cf/moonshotai/kimi-k2.6",
  instructions: `You are content-agent, an AI that writes practical developer tutorials.
Never invent information you are not confident about.
Never write partial code snippets — every code block must be complete.
Write for developers who know the language but not this specific topic.
Explain why, not just what. Every code block deserves a sentence of context.`,
  skills: [writerSkill],
})),
```

The model `cloudflare/@cf/moonshotai/kimi-k2.6` runs on Workers AI with no API key required. The `skills` array is what makes the skill available to call by name inside the session.

Finally, the `run` function. This is where the workflow actually does its work — create a session, call the skill, return the result:

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

`harness.session()` creates a conversation thread backed by the Durable Object's SQLite. `session.skill("writer", ...)` sends the skill's instructions and your args to the model. The `result` schema validates the response — if the model returns something that doesn't match, Flue retries automatically. Whatever `run` returns gets stored in the run record and sent back to the caller.

## Wiring up the app

Open `.flue/app.ts` and mount Flue's routing layer. Because the workflow exports `route` and `runs`, the `/workflows/generate` and `/runs/:runId` endpoints are handled automatically:

```typescript
import { flue } from "@flue/runtime/routing";
import { Hono, type Hono as HonoApp } from "hono";

const app = new Hono();
app.get("/health", (c) => c.json({ ok: true }));
app.route("/", flue() as unknown as HonoApp);

export default app;
```

## Running it

Start the dev server:

```bash
npx flue dev --target cloudflare
```

Send it a topic. The `?wait=result` parameter holds the connection open and returns the result directly:

```bash
curl -X POST "http://localhost:3583/workflows/generate?wait=result" \
  -H "Content-Type: application/json" \
  -d '{"topic": "How to use Cloudflare KV to cache API responses in a Worker"}'
```

This takes 30–90 seconds and returns a JSON object with `result.title` and `result.tutorial`. Read the output. If the tutorials feel generic, edit `SKILL.md` and retest. That's the whole iteration loop.

## Deploying

Build and deploy from the build output. Flue generates its own `wrangler.json` with merged bindings:

```bash
npx flue build --target cloudflare
npx wrangler deploy --config dist/content-agent/wrangler.json
```

## What I'd add next

The agent as-is generates from existing model knowledge alone. The most impactful next step is giving it search functionality so the agent can read fresh documentation before writing. For topics involving specific APIs, the quality difference is significant.

Another option is to add an outline phase. A second `session.skill()` call that produces a structured outline before writing starts. The writer session gets the outline as an arg and stays focused on one section at a time instead of planning and writing in a single pass.

**Key takeaways:**

- Flue agents are built from four pieces: workflow, agent, session, and skills. Every agent is a combination of the same parts.
- Skills are `.md` files imported at build time with `with { type: 'skill' }`. The quality of the skill file is the biggest driver of output quality.
- The `instructions` field on `defineAgent` is the agent's identity. It applies across all sessions regardless of which skill runs.
- `?wait=result` on the workflow endpoint returns the result inline without polling.
