---
title: Optimizing Compute Costs for AI Agents
slug: optimizing-compute-costs-ai-agents
pubDate: 2026-08-05T00:00:00.000Z
description: >-
  Agents spend most of their wall-clock time waiting on model inference.
  Depending on your execution environment, you're paying full price for every
  second of that wait.
tags:
  - ai
  - agents
  - cloudflare
coverImage: ./cover.png
---

AI agents are taking on more and more complex workloads. They don’t just generate text. They read files, run tests, clone repos, execute code. Doing these types of workloads leads to different constraints. Figuring out the optimal environment to run individual pieces of work in is a challenge.

An easy answer to this problem is to just give each agent a full container. This means giving a capable environment to each agent even if those capabilities aren’t needed. It’s a simplistic answer to a complicated problem. However, this leads to concern around cost.

## Cost implications

Many container platforms bill on **wall clock**, the elapsed real time between the environment starting and stopping. You can literally think of this as the amount of time passed on a wall clock. The meter tracks existence, not actual work being done.

The alternative is billing on CPU time, where the meter only advances while your code is actually executing on a core. A process sitting on an `await` accumulates wall clock but not CPU time. Time waiting for I/O doesn’t count against you. Cloudflare Workers, for example, bill on CPU time under the standard usage model, not on wall clock.

To make that concrete, picture one turn of a coding agent that edits a file and runs the test suite. Rough, illustrative numbers:

- **\~20s** waiting on the model to decide what to do
- **\~300ms** actually running `grep` and writing the file
- **\~8s** running the test suite

That's about 28 seconds of wall clock and about 8 seconds where anything in your environment is executing. Bill that on wall clock and you paid for all 28. Roughly 70% of the bill is based on your environment waiting.

## Environment options

One of the first exercises you should work through is deciding what functionality your agent actually needs. Go look at what your agent spends its time doing.

Here are three different environment options to consider based on different needs.

### 1. Basic shell commands

[just-bash](https://justbash.dev/) is “A virtual bash environment with an in-memory filesystem, written in TypeScript and designed for AI agents”. This basically allows your AI agents to run bash commands in a JavaScript environment. Much of what an agent does to a codebase is reading files, searching text, and making small edits.

### 2. Running JavaScript

Sometimes a shell one-liner isn't enough and your agent will want to actually write code. Loops, a library, structured input and output. So, instead of a command, you pass along a JavaScript module. It runs the code, and you get back a result.

### 3. An actual operating system

Then there's the work that genuinely needs a machine. Running `npm install`, compiling something native, running a test suite against real binaries, or generating a PDF with something like `pandoc`. There's no clever way around this one. For this, you need a full operating system.

## How to choose your setup

The first option is to pick one type of environment and run all of your work there. As we’ve shown, this is the simplest, but it probably means you’re overpaying in some cases.

Secondly, you could statically route different workflows to different environments. You decide up front which task types go where. This helps ensure optimal environments for the work that you have well-defined in your head. However, you don’t always know exactly what work the agent will decide it needs to do.

Lastly, there’s an option that I hadn’t thought about until recently. That option is letting the agent choose the environment per command. The agent knows what it's about to run. It has more specific context at that point than you would have if you went with option 2. Up front, you can give it a cheap path and an expensive path, describe both honestly, and let it choose per call.

## What this looks like in practice

Everything so far has been vendor-agnostic, and the reasoning holds regardless of where you run. But it's worth looking at one concrete implementation. `@cloudflare/computer` went into early preview recently and does exactly this.

It includes environment options similar to what we talked about above:

1. Worker shell - a shell running in an isolate
2. Worker JavaScript - a JavaScript runtime in an isolate
3. Container - a full Linux container

You can then define your backends with a description in plain English of when each should be used. From here, the agent can make a decision where to run each individual command.

For more details on how it all works, check out the [announcement post](https://blog.cloudflare.com/cloudflare-computer/).

## Wrap up

`@cloudflare/computer` is just one specific product. The concept behind why it exists is the important takeaway. Agents spend most of their elapsed time waiting on a model, and the environment you gave them is sitting idle while that happens. Multiply that across every agent you're running and "one container each" starts to rack up the cost.

That’s why it’s important to optimize the cost of environments that different pieces of your workflow run in. What other tips do you have? Let me know in this [tweet](https://x.com/jamesqquick/status/2085000260804333931?s=20).
