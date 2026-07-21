---
title: The Best TypeScript Tools for Building AI Agents (2026)
slug: best-typescript-tools-ai-agents-2026
pubDate: 2026-07-21
description: >-
  A breakdown of the top TypeScript tools for building AI agents, from
  lightweight AI SDKs to durable runtimes, with tradeoffs and code examples
  for each.
tags:
  - ai
  - typescript
  - agents
coverImage: ./cover.webp
---

Getting started building your own agents can be pretty daunting. The ecosystem moves incredibly fast, and there are now dozens of options that all claim to be the solution. Many of them solve different problems at different layers of the stack which makes it hard to compare them directly.

So, here are the top TypeScript tools for building AI agents and their strengths and tradeoffs. The goal is not to choose a winner. Different projects have different needs, and the right choice depends on what you are building and where you plan to run it.

Here's the full list if you want to jump to any specific tool directly.

- [Vercel AI SDK](#vercel-ai-sdk)  
- [TanStack AI](#tanstack-ai)  
- [LangChain.js](#langchainjs)  
- [OpenAI Agents SDK](#openai-agents-sdk)  
- [Mastra](#mastra)  
- [LangGraph.js](#langgraphjs)  
- [Cloudflare Agents SDK](#cloudflare-agents-sdk)  
- [Inngest AgentKit](#inngest-agentkit)  
- [Claude Agent SDK](#claude-agent-sdk)  
- [eve (Vercel)](#eve-vercel)  
- [Flue](#flue)

## Terms worth knowing first

A few terms get used loosely in this space, so let's define them.

**AI agent.** An agent is a language model paired with instructions, tools, and a loop that runs toward a goal. The model decides what to do, the tools let it take action, and the loop keeps going until the task is done.

**Framework vs. runtime vs. harness.** These three layers are easy to confuse, and most tools sit primarily in one of them:

- A **framework** gives you abstractions to create agents quickly by defining tools, prompt, model, etc.  
- A **runtime** provides the production plumbing to keep agents running: durable execution, persistence, streaming, and human-in-the-loop  
- A **harness** is the opinionated loop engine itself, usually with built-in tools, planning, and subagents

## How these tools are organized

The tools below fall into four categories based on where their primary value sits. The boundaries are not hard. Several tools span more than one layer, but the groupings reflect the kind of problem each one is designed to solve first.

**AI Integration SDKs** are the lightest layer. They handle streaming, typed tools, and provider portability so you can add AI to an existing app without committing to a specific infrastructure. Persistence and orchestration are yours to provide.

**Agent Frameworks** give you higher-level agent primitives: tools, memory, multi-agent patterns, and pre-built architectures that go beyond a single model call. A good fit when you know you are building an agent, not just adding a chat box.

**Durable Runtimes** handle the production plumbing for agents that need to run for minutes, hours, or longer. Checkpointing, recoverable execution, and persistent state are first-class concerns here rather than things you bolt on later.

**Harness-Based Platforms** wrap a pre-built autonomous agent. The core agent behavior ships with the platform; you configure tools, skills, and channels on top of it. The tradeoff is that you are extending something opinionated rather than composing something from scratch.

## How we judge each tool

To make these tools comparable across the board, every one is evaluated against the same five criteria. The goal is a consistent lens, not a scorecard where more checkmarks win.

- **Model flexibility.** Can you use any model and provider, or is the tool tied to a specific vendor?  
- **Deploy target.** Does it run on any infrastructure, or is it coupled to a specific platform or runtime?  
- **Durable execution.** Agents often wait on people or slow systems and can run for minutes, hours, or longer. Durable execution means the agent's progress is checkpointed, so it can survive a crash or a deploy and resume where it stopped instead of starting over. Is that built in, or do you add it yourself?  
- **Persistence.** Does the tool store conversation history and state across requests out of the box, or do you bring your own store?  
- **Batteries included (low / medium / high).** How much of the path to production is given to you versus how much do you assemble yourself? **A low rating** means a thin, composable layer. **A high rating** means most agent behavior and production plumbing is handled for you.

Model flexibility and deploy target can be summed up as a tool's overall **vendor lock-in**, which you'll see summarized in the comparison table. Tools that run anywhere and work with any model sit at the low end; tools tied to a specific cloud or model provider sit at the high end.

## AI Integration SDKs

### Vercel AI SDK

**What it is:** "The TypeScript toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more."

The AI SDK helps to standardize integrating with AI and has support for 90+ model providers through one interface. It includes streaming, structured output, tool calling, MCP, and a terminal UI for local development.

Two key classes:

`ToolLoopAgent` for defining the loop yourself (including model, tools, instructions, etc.)

```ts
import { ToolLoopAgent } from "ai";

const agent = new ToolLoopAgent({
  model: "xai/grok-4.5",
  instructions: "You are a helpful assistant.",
  tools: {
    weather: weatherTool,
    calculator: calculatorTool,
  },
});
```

`HarnessAgent` for using an existing harness (e.g. OpenCode, Claude Code, Codex, and Pi)

```ts
import { HarnessAgent } from "@ai-sdk/harness/agent";
import { claudeCode } from "@ai-sdk/harness-claude-code";
import { createVercelSandbox } from "@ai-sdk/sandbox-vercel";

export const agent = new HarnessAgent({
  harness: claudeCode,
  sandbox: createVercelSandbox({
    runtime: "node24",
    ports: [4000],
  }),
  instructions:
    "You are a careful coding assistant. Prefer small changes and explain tradeoffs.",
});
```

**Summary:**

- **Model flexibility:** Any (90+ providers)  
- **Deploy target:** Anywhere  
- **Durable execution:** No (bring your own)  
- **Persistence:** No (bring your own)  
- **Batteries included:** Low

**Docs:** [https://ai-sdk.dev/docs/agents](https://ai-sdk.dev/docs/agents)

### TanStack AI

**What it is:** "A lightweight, type-safe SDK for building production-ready AI experiences."

TanStack AI is the AI layer from the team behind React Query, TanStack Router, and TanStack Start. It focuses on the boundary between your UI and your models: typed tools defined once and used on client or server, streaming responses, AG-UI-compatible clients, and provider adapters for OpenAI, Anthropic, Gemini, OpenRouter, Ollama, and more. It ships first-class hooks for React and Solid, with a framework-agnostic core you can use from any TypeScript app.

Its core primitive is `toolDefinition()`, which separates a tool's input/output schema from its implementation, letting you deploy the same tool to a server or client environment without rewriting it.

```ts
import { chat, toolDefinition } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { z } from "zod";

const getWeather = toolDefinition({
  name: "getWeather",
  description: "Get the current weather for a city",
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ temperature: z.number(), condition: z.string() }),
}).server(async ({ city }) => {
  return { temperature: 72, condition: "sunny" };
});

chat({
  adapter: openaiText("gpt-5.2"),
  messages: [{ role: "user", content: "What's the weather in Austin?" }],
  tools: [getWeather],
});
```

**Summary:**

- **Model flexibility:** Any (9+ providers)  
- **Deploy target:** Anywhere  
- **Durable execution:** No (bring your own)  
- **Persistence:** No (bring your own)  
- **Batteries included:** Low

**Docs:** [https://tanstack.com/ai/latest/docs](https://tanstack.com/ai/latest/docs)

## Agent Frameworks

### LangChain.js

**What it is:** "LangChain is a framework for building LLM-powered applications. It helps you chain together interoperable components and third-party integrations to simplify AI application development -- all while future-proofing decisions as the underlying technology evolves."

LangChain.js offers prebuilt agent architectures, a very large catalog of integrations, memory, and support for multi-agent and subagent patterns.

LangChain is a high-level framework that many people start with. It's built on LangGraph (details below), the lower-level runtime that handles durable execution and orchestration. You can use LangChain without ever touching LangGraph directly, or drop down to LangGraph when you need fine-grained control.

```ts
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [getWeather],
});

console.log(
  await agent.invoke({
    messages: [
      { role: "user", content: "What's the weather in San Francisco?" },
    ],
  }),
);
```

**Summary:**

- **Model flexibility:** Any  
- **Deploy target:** Anywhere  
- **Durable execution:** Yes (via LangGraph, the underlying runtime)  
- **Persistence:** Opt-in via a LangGraph [checkpointer](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) (in-memory by default; DB-backed for durability)  
- **Batteries included:** Medium

**Docs:** [https://docs.langchain.com/oss/javascript/langchain/overview](https://docs.langchain.com/oss/javascript/langchain/overview)

### OpenAI Agents SDK

**What it is:** OpenAI's lightweight TypeScript framework for building agents.

OpenAI Agents SDK provides agents, handoffs between agents, guardrails, sessions, tracing, and first-class realtime and voice support. While this is optimized for OpenAI models, it also works with other models through the AI SDK adapter or OpenAI-compatible endpoints such as [Cloudflare's AI Gateway](https://www.cloudflare.com/products/ai-gateway/) and [OpenRouter](https://openrouter.ai/).

```ts
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "History tutor",
  instructions: "You answer history questions clearly and concisely.",
  model: "gpt-5.5",
});

const result = await run(agent, "When did the Roman Empire fall?");
console.log(result.finalOutput);
```

**Summary:**

- **Model flexibility:** OpenAI-first (others via adapter or OpenAI-compatible endpoints)  
- **Deploy target:** Anywhere  
- **Durable execution:** No (bring your own)  
- **Persistence:** No (bring your own)  
- **Batteries included:** Medium

**Docs:** [https://openai.github.io/openai-agents-js/](https://openai.github.io/openai-agents-js/)

### Mastra

**What it is:** "Mastra is a TypeScript framework that gives you everything you need to prototype fast and ship with confidence."

Mastra bundles agents, graph-based workflows, memory, retrieval-augmented generation, evals, observability, and MCP authoring. It supports suspending and resuming workflows. It also includes a [Studio](https://mastra.ai/docs/studio/overview) that provides an interactive UI for building, testing, and managing agents, workflows, and tools.

Its durability and persistence aren't built in the way a dedicated runtime's are -- they're assembled from pluggable backends, which is why it stays portable. Persistence runs through a storage adapter you back with your own database (libSQL, PostgreSQL, MongoDB, Redis, Cloudflare D1/Durable Objects, and more); the default is in-memory and non-persistent.

Durable execution uses Mastra's built-in workflow engine, which snapshots run state to that same store so workflows can suspend and resume across restarts. For distributed or resumable streaming you swap the in-process event bus for a PubSub backend like Redis Streams or Google Cloud Pub/Sub.

You can also optionally offload workflow execution to a managed runner such as Inngest, the company behind [AgentKit](#inngest-agentkit) below, for step memoization, retries, and monitoring.

```ts
import { Agent } from "@mastra/core/agent";

export const helloAgent = new Agent({
  id: "hello-agent",
  name: "Hello Agent",
  instructions: "You are a friendly assistant that greets people warmly.",
  model: "openai/gpt-5.5", // provider/model via Mastra's model router
});
```

**Summary:**

- **Model flexibility:** Any (via Mastra's model router)  
- **Deploy target:** Anywhere  
- **Durable execution:** Partial (suspend/resume via built-in workflow engine; managed runners like Inngest optional)  
- **Persistence:** Yes, but bring your own DB (pluggable storage adapter; in-memory by default)  
- **Batteries included:** High

**Docs:** [https://mastra.ai/docs](https://mastra.ai/docs)

## Durable Runtimes

### LangGraph.js

**What it is:** "LangGraph is a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents."

LangGraph models agent behavior as a graph with explicit control flow, and provides low level support for checkpointing, persistence, human-in-the-loop, and streaming. As mentioned above, LangChain uses LangGraph under the hood.

```ts
import {
  StateSchema,
  MessagesValue,
  type GraphNode,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

const State = new StateSchema({
  messages: MessagesValue,
});

const mockLlm: GraphNode<typeof State> = (state) => {
  return { messages: [{ role: "ai", content: "hello world" }] };
};

const graph = new StateGraph(State)
  .addNode("mock_llm", mockLlm)
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END)
  .compile();

await graph.invoke({ messages: [{ role: "user", content: "hi!" }] });
```

**Summary:**

- **Model flexibility:** Any  
- **Deploy target:** Anywhere  
- **Durable execution:** Yes (checkpointing built in)  
- **Persistence:** Yes  
- **Batteries included:** Medium

**Docs:** [https://docs.langchain.com/oss/javascript/langgraph/overview](https://docs.langchain.com/oss/javascript/langgraph/overview)

### Cloudflare Agents SDK

**What it is:** A durable agent runtime that runs on Cloudflare Workers and Durable Objects.

The Cloudflare Agents SDK gives each agent session a durable identity with local SQL storage, real-time WebSocket connections, scheduling, and recoverable execution. It includes channels for chat, voice, email, and Slack, plus MCP, browser, and sandbox tools.

Additionally, you can use [Project Think](https://developers.cloudflare.com/agents/harnesses/think/), an opinionated harness that wires up the agentic loop, persistent memory, streaming, and built-in tools on top of the runtime. You extend a single base class instead of building the loop yourself. Its design is inspired by Pi, the same harness behind Flue.

```ts
import { Think } from "@cloudflare/think";
import { createWorkersAI } from "workers-ai-provider";
import { routeAgentRequest } from "agents";

export class MyAgent extends Think<Env> {
  getModel() {
    return createWorkersAI({ binding: this.env.AI })(
      "@cf/moonshotai/kimi-k2.6",
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
```

**Summary:**

- **Model flexibility:** Any (free starter runs on Workers AI, no API key)  
- **Deploy target:** Cloudflare only (Workers + Durable Objects)  
- **Durable execution:** Yes (recoverable execution)  
- **Persistence:** Yes (local SQL per session)  
- **Batteries included:** High

**Docs:** [https://developers.cloudflare.com/agents/](https://developers.cloudflare.com/agents/)

### Inngest AgentKit

**What it is:** An agent framework built on top of Inngest's durable functions.

AgentKit lets you compose agents into networks with routers that decide which agent runs next, all backed by durable steps, automatic retries, and recovery. It supports MCP and provides local tracing.

```ts
import { createAgent, openai } from "@inngest/agent-kit";

const assistant = createAgent({
  name: "Assistant",
  system: "You are a helpful assistant.",
  model: openai({ model: "gpt-5.5" }),
});

const result = await assistant.run("When did the Roman Empire fall?");
console.log(result);
```

**Summary:**

- **Model flexibility:** Any  
- **Deploy target:** Anywhere (strongest guarantees on the Inngest platform)  
- **Durable execution:** Yes (durable steps with retries and recovery)  
- **Persistence:** Yes (durable steps)  
- **Batteries included:** Medium

**Docs:** [https://agentkit.inngest.com/](https://agentkit.inngest.com/)

## Harness-Based Platforms

### [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)

**What it is:** Anthropic's SDK that wraps the Claude Code harness.

The Claude Agent SDK gives you a capable autonomous agent out of the box, with file access, shell tools, subagents, hooks, MCP support, session resume, and file checkpointing. Everything that's available to you in Claude Code is available in the SDK.

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.ts",
  options: { allowedTools: ["Read", "Edit", "Bash"] },
})) {
  console.log(message); // Claude reads the file, finds the bug, edits it
}
```

**Summary:**

- **Model flexibility:** Anthropic only  
- **Deploy target:** Anywhere (bundled Claude Code binary)  
- **Durable execution:** Yes (session resume + file checkpointing)  
- **Persistence:** Yes (session state + file checkpoints)  
- **Batteries included:** High

**Docs:** [https://code.claude.com/docs/en/agent-sdk/typescript](https://code.claude.com/docs/en/agent-sdk/typescript)

### eve (Vercel)

**What it is:** "Like Next.js for agents. Build durable agents with one folder."

A newer open-source framework from Vercel, built around the idea that an agent is a directory of files. It ships with production concerns built in: durable sessions, sandboxed compute, human-in-the-loop approvals, subagents, channels, evals, and OpenTelemetry tracing. Agents deploy with a standard `vercel deploy`.

```ts
// agent/agent.ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-opus-4.8",
});
```

**Summary:**

- **Model flexibility:** Any  
- **Deploy target:** Best on Vercel  
- **Durable execution:** Yes (durable sessions)  
- **Persistence:** Yes (durable sessions)  
- **Batteries included:** High

**Docs:** [https://eve.dev/docs](https://eve.dev/docs)

### Flue

**What it is:** "Build durable AI agents and workflows with Flue's programmable TypeScript harness. Write once, deploy anywhere, use any LLM."

A durable, programmable TypeScript agent framework from the Astro team, built on the Pi agent harness. It provides autonomous agents with sandboxes, skills, subagents, MCP, and channels. It is durable by default, works with any model, and deploys to a wide range of platforms including Cloudflare, AWS, Docker, Fly, and Railway.

```ts
// agents/hello-world.ts
import { defineAgent } from "@flue/runtime";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  instructions: 'Tell a funny "hello world" engineering joke.',
}));
```

**Summary:**

- **Model flexibility:** Any  
- **Deploy target:** Anywhere (Cloudflare, AWS, Docker, Fly, Railway)  
- **Durable execution:** Yes (durable by default)  
- **Persistence:** Yes  
- **Batteries included:** High

**Docs:** [https://flueframework.com/docs](https://flueframework.com/docs)

---

## Comparison at a glance

| Framework | Classification | Model flexibility | Deploy target | Durable execution | Persistence | Batteries included | Vendor lock-in |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Vercel AI SDK | AI Integration SDK | Any (90+) | Anywhere | No (BYO) | No (BYO) | Low | Low |
| TanStack AI | AI Integration SDK | Any (9+) | Anywhere | No | No | Low | Low |
| LangChain.js | Agent Framework | Any | Anywhere | Via LangGraph | Opt-in (checkpointer) | Medium | Low-medium |
| OpenAI Agents SDK | Agent Framework | OpenAI-first | Anywhere | No (BYO) | No (BYO) | Medium | Medium |
| Mastra | Agent Framework | Any | Anywhere | Partial | Yes | High | Low |
| LangGraph.js | Durable Runtime | Any | Anywhere | Yes | Yes | Medium | Low-medium |
| Cloudflare Agents SDK | Durable Runtime | Any | Cloudflare only | Yes | Yes | High | High |
| Inngest AgentKit | Durable Runtime | Any | Anywhere | Yes | Yes | Medium | Medium |
| Claude Agent SDK | Harness-Based Platform | Anthropic only | Anywhere (bundled binary) | Yes | Yes | High | High |
| eve (Vercel) | Harness-Based Platform | Any | Best on Vercel | Yes | Yes | High | Medium |
| Flue | Harness-Based Platform | Any | Anywhere | Yes | Yes | High | Low |

## Honorable mentions and the layer underneath

A few other TypeScript tools are worth a look depending on your needs: **VoltAgent**, **Genkit** from Google, and **LlamaIndex.TS** for retrieval-heavy agents.

It is also worth knowing the harness layer that some of these frameworks run on. **Pi** powers Flue, and **Claude Code** powers the Claude Agent SDK. Other harnesses in the same category include **Codex**, **OpenCode**, **Deep Agents**, and Cloudflare's [**Project Think**](https://developers.cloudflare.com/agents/harnesses/think/) (itself inspired by Pi). You do not need to choose a harness directly to build an agent, but understanding the layer explains how tools like Flue and eve work under the hood.

## Conclusion

There is no single best framework for building AI agents in TypeScript. The right pick depends on how much you want handled for you, how long your agents need to run, and how much you care about staying portable across clouds and models. If you are just starting out, the Vercel AI SDK or LangChain.js will get you moving quickly. If you need durability and scale, look at LangGraph, Cloudflare, Inngest, eve, or Flue. And if you are tied to a specific model provider, their first-party SDKs are a reasonable default.

The most useful thing you can do is pick one, build a small real agent with it, and learn where it helps and where it gets in your way. The concepts carry over, so the time is not wasted no matter which one you start with.
