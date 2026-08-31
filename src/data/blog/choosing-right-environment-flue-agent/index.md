---
title: Choosing the Right Environment for Your Flue Agent
pubDate: 2026-08-13T00:00:00.000Z
description: >-
  Compare Flue agent sandbox options, from no sandbox and virtual filesystems to
  local and remote environments, and learn when to use each one.
tags:
  - ai
  - flue
  - cloudflare
coverImage: ./cover.png
---

As I'm spending more time building AI agents with [Flue](https://flueframework.com/), I'm intentionally diving deeper into different aspects of the framework. In this article, I want to focus on sandboxes: what options you have and when to use one over the other (if you need one at all).

To make this more digestible, and different from the docs, I'm going to take a practical approach. We'll focus on specific agents related to content creation and use the different needs of each one to explain the use cases for each type of sandbox.

Here are the agents we'll walk through:

- **Grammar/style reviewer** - Reviews pasted draft text against your voice guide and returns edit suggestions.
- **SEO metadata generator** - Takes a transcript and calls a fixed keyword-research API to draft a title, description, and tags.
- **Data-reshaping assistant** - Takes a pasted CSV of video analytics, filters and reorders the data, then returns the updated data.
- **Markdown formatter** - Takes a rough draft, seeds it into an in-memory file, and runs a linter-like pass with **`sed`** and **`awk`** to normalize heading levels and spacing.
- **Code snippet verifier** - Takes the TypeScript snippets from a draft post, actually runs **`npm install`** and **`tsc`**/**`node`** against them to confirm they compile and execute correctly.

## What are sandboxes?

Let's start at the beginning and define what a sandbox is. From the [Flue docs](https://flueframework.com/), "**A sandbox** is an execution environment you attach to an agent: a filesystem and shell where it reads, writes, and runs commands. An agent doesn't have one unless you give it one. `useSandbox()` is what adds file and command access."

A couple of important things are worth noting. First, sandboxes are defined at the agent level. If you have different workflows that need to run in different sandboxes, you have to define the work with multiple different agents.

Second, agents don't get sandboxes by default. We'll talk about what you get by default in a second, but you have to opt in to having a sandbox at all.

## Deploy target vs. sandbox

When it comes to where your code runs, there are two things we need to distinguish between. The first is the environment that you're going to deploy to, or the deploy target. See the [Choose a target docs](https://flueframework.com/docs/guide/deploy/#choose-a-target) for reference.

By default, the deployment target is a traditional Node.js application. Let's start there.

With Node.js, your agent runs as a regular OS process, such as `node dist/server.mjs`. This could be within a container, a VM, or whatever you deployed it in. That process already has a real filesystem and shell, but Flue doesn't expose either to the model until you explicitly opt in to a sandbox. Remember the note about opting in to a sandbox above?

This is an important decision to limit capabilities by default. Your agents get as limited a scope of access as possible until you decide otherwise. They only have access to the tools that you provide to them.

Cloudflare is the second option, which comes with a more intricate architecture behind the scenes. Each agent conversation runs inside its own [Durable Object](https://developers.cloudflare.com/durable-objects/), a V8 isolate ([more on V8 isolates](https://developers.cloudflare.com/workers/reference/how-workers-works/)). In comparison to a Node.js deployment, there's no filesystem or shell here.

## No sandbox at all

Although the goal of this article is to cover sandboxes, it's important to first decide if you even need one. In fact, several of the content-creation agents we listed at the beginning can be created with no sandbox at all.

Although the model itself won't have direct network access, it has access to tools that can make fetch requests. Through tool calls and skills, you can easily build useful agents with no sandbox.

For example, the grammar/style reviewer only needs access to the draft text and a skill that defines the voice guide. A simplified version might look like this:

```typescript
"use agent";

import { useModel, useSkill, useTool } from "@flue/runtime";
import { getDraft } from "../tools/get-draft";
import { voiceGuide } from "../skills/voice-guide";

export function GrammarReviewer() {
  useModel("anthropic/claude-sonnet-4-6");
  useTool(getDraft);
  useSkill(voiceGuide);
  return "Review the draft returned by get_draft against the style guide and return specific edit suggestions.";
}
```

Let's take another example, the SEO metadata generator. Again, you could reasonably build this agent with just a tool and a skill.

```typescript
"use agent";

import { useModel, useTool } from "@flue/runtime";
import { getTranscript } from "../tools/get-transcript";

export function SeoMetadataGenerator() {
  useModel("anthropic/claude-sonnet-4-6");
  useTool(getTranscript);
  return "Draft a title, description, and tags for the transcript from get_transcript";
}
```

So, what if our agent needs to run a terminal command or access the filesystem? If you give a Flue agent a prompt to run a bash command or read a file without configuring a sandbox, it will fail.

This is where we hit our first limitation and move on to the virtual sandbox.

## Virtual sandbox

The virtual sandbox is the lightest option. It comes with an in-memory filesystem paired with an emulated bash [using just-bash](https://justbash.dev/), running entirely in TypeScript. It works the same on both deploy targets since there's no host binding involved.

This means you can do basic bash commands, such as making curl requests and transforming text. The filesystem is ephemeral, so it resets each time the agent is initialized. Any files you want to read have to be written first based on the input.

Let's look at our next agent example, the data-reshaping assistant. It's going to do reshaping with bash commands, so it needs a file to work with. It takes the input body and writes it to a new file in the sandbox. The prompt then tells the agent to run a series of bash commands to filter and transform the data and return the result.

```typescript
"use agent";

import { bash, useDelivery, useModel, useSandbox } from "@flue/runtime";
import { Bash, InMemoryFs } from "just-bash";

export function ContentCsvReshaper() {
  useModel("openai/gpt-5.4-nano");

  const delivery = useDelivery();

  useSandbox(
    bash(
      () =>
        new Bash({
          fs: new InMemoryFs({
            "/workspace/input.csv": delivery.body,
          }),
        })
    )
  );

  return `
    Use Bash to reshape /workspace/input.csv:

    1. Keep only rows where the status column is "published".
    2. Select and reorder the title, category, and views columns.
    3. Sort the result by views in descending order.
    4. Write the result to /workspace/reshaped.csv.

    Read /workspace/reshaped.csv and return its contents.
  `;
}
```

This would be similar if we wanted to create an agent to format Markdown. It needs text input that it can write to a file, then it can run bash commands against that file.

```typescript
"use agent";

import { bash, useDelivery, useModel, useSandbox } from "@flue/runtime";
import { Bash, InMemoryFs } from "just-bash";

export function TranscriptCleaner() {
  useModel("anthropic/claude-haiku-4-5");

  const delivery = useDelivery();
  const transcript = delivery.body;

  useSandbox(
    bash(
      () =>
        new Bash({
          fs: new InMemoryFs({
            "/workspace/transcript.txt": transcript,
          }),
        })
    )
  );

  return `
Read /workspace/transcript.txt.
Remove timestamps and filler words.
Write the cleaned transcript to /workspace/cleaned.txt.
Return the contents of /workspace/cleaned.txt.
`;
}
```

So what's the next limitation? What if we wanted to create a file that another agent could work with, or what if we actually wanted to run some code? With a virtual sandbox, we have access to bash and a virtual system, but there are big limitations.

The filesystem is ephemeral, so other agents can't read the outputs of other agents. Additionally, we don't have the ability to run code. For that, we need to move to either a local or a remote sandbox.

## `local()`: binding to the host process (Node only)

The `local()` option allows your agent to run in the same OS process your Node server is already running in. If you remember the Node target, by default your agent won't have access to a shell, filesystem, or similar capabilities.

Using `local()` enables that access. However, keep in mind that this runs directly alongside your deployed app or agent with no isolation.

That makes it a good fit for dev tools, CI tasks, coding agents, and self-hosted automation, where the host process either is the workspace or already sits inside your own isolation boundary. It's a bad fit for anything handling untrusted input or multiple tenants.

In this example, the agent verifies a TypeScript snippet provided in a file on the filesystem.

```typescript
"use agent";

import { useModel, useSandbox } from "@flue/runtime";
import { local } from "@flue/runtime/node";

export function TSSnippetVerifier() {
  useModel("openai/gpt-5.4-nano");
  useSandbox(local());

  return `
    Verify the following TypeScript code snippet from the local file provided by the user. Read that file, run the TypeScript compiler with --noEmit, and report whether it passes. Include any compiler diagnostics.
  `;
}
```

One important detail is that the shell your agent gets access to does not include every environment variable. Flue intentionally restricts this to only a few by default (`PATH`, `HOME`, and so on). The goal is to avoid agents leaking secret credentials. Agents can't leak what they don't have access to.

If you have a secret credential that you want your local environment to have access to, you have to explicitly pass it along. Here's an example that passes along the `GH_TOKEN` variable.

```typescript
useSandbox(local({ env: { GH_TOKEN: process.env.GH_TOKEN } }));
```

So what's the downside or limitation here? There's no separation or boundary between the agent runtime and the sandbox environment. This means your agent could potentially:

- Destroy or corrupt necessary files.
- Leak secret credentials from local files.
- Consume large amounts of CPU, memory, disk space, and so on.

Remote sandboxes solve this problem.

## Remote sandboxes

Remote sandboxes provide complete isolation and a full Linux environment. There are several options for remote sandboxes, but we'll use Cloudflare for the following examples.

Let's take the previous agent for TypeScript snippet verification. If we wanted to ensure there were no negative side effects, we'd run it in a remote sandbox. See the [Flue docs for setting up a Cloudflare Sandbox](https://flueframework.com/docs/ecosystem/sandboxes/cloudflare/) for specific setup details.

You'll also need Docker Desktop installed and running on your machine.

With the setup in place, the code stays primarily the same except for the sandbox configuration.

```typescript
"use agent";

import {
  getSandbox,
  type Sandbox as CloudflareSandbox,
} from "@cloudflare/sandbox";
import { type AgentProps, useModel, useSandbox } from "@flue/runtime";
import { cloudflareSandbox } from "@flue/runtime/cloudflare";
import { env } from "cloudflare:workers";

export function CloudflareTSSnippetVerifier({ id }: AgentProps) {
  useModel("openai/gpt-5.4-nano");

  useSandbox(
    cloudflareSandbox(
      getSandbox(env.Sandbox as DurableObjectNamespace<CloudflareSandbox>, id)
    ),
    {
      cwd: "/workspace",
    }
  );

  return `
    Verify the following TypeScript code snippet from the local file provided by
    the user. Read that file, run the TypeScript compiler with --noEmit, and
    report whether it passes. Include any compiler diagnostics.
  `;
}
```

If you're not on Cloudflare, the same pattern applies to providers like Daytona, E2B, or Modal. You can follow the docs and use the `flue add sandbox <provider>` command to scaffold the adapter for you.

## Picking your sandbox

Now that you know a little about the different sandbox options, you should feel more comfortable deciding between them based on the agent you're building. Here are a few factors to consider:

- **Isolation** - Does this need to be walled off from your host and other conversations, or is trust already established?
- **Durability** - Does work need to survive a restart, or is scratch space fine?
- **Capability** - Does the agent need plain text tools (`curl`, `jq`, `sed`), or a full Linux toolchain with native binaries and package managers?
- **Cost and latency** - In-memory is instant; a remote container has provisioning and RPC overhead.

In general, I'd start by choosing the narrowest environment that supports the task. This should ensure an appropriate level of cost, speed, and security.
