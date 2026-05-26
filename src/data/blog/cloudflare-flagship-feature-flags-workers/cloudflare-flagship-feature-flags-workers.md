---
title: "Cloudflare Flagship: Feature Flags Built Into Workers"
slug: cloudflare-flagship-feature-flags-workers
pubDate: 2026-05-26T00:00:00.000Z
description: >-
  Cloudflare Flagship is now in public beta — native feature flags for Workers
  with no SDK or third-party service required. Here's what the setup looks like
  and how I'm using it in a real app.
tags:
  - cloudflare
  - typescript
  - javascript
coverImage: ./cover.png
---

Feature flags used to mean picking a vendor, signing up, installing an SDK, and wiring up another integration. If you're already building on Cloudflare Workers, Flagship removes all of that. It's a native feature flag service built directly into the Workers runtime — and it just hit public beta.

I've been using it in my [Quick Cuts](https://quickcuts.app) app for a few weeks now. Here's what the setup looks like and why I like it.

## What Is Flagship?

Flagship is Cloudflare's feature flag service. You define flags in the Cloudflare dashboard, and then evaluate them directly inside your Workers through a native binding. No outbound HTTP calls to a third-party API, no separate SDK to install and keep up to date, no extra vendor to manage.

Flags support:

- Boolean, string, number, and object values
- Targeting rules based on user attributes (11 comparison operators, AND/OR grouping)
- Percentage-based rollouts with consistent hashing
- Audit history in the dashboard

It's also [OpenFeature](https://openfeature.dev/) compatible — OpenFeature is a CNCF open standard that defines a vendor-agnostic API for feature flag evaluation, so you can swap providers without rewriting your flag calls. This means you can use the `@cloudflare/flagship` SDK from Node.js or the browser if you need to evaluate flags outside of Workers.

## Setting It Up

Configuration lives in `wrangler.jsonc`. Add a `flagship` binding:

```jsonc
"flagship": [
  {
    "binding": "FLAGS",
    "app_id": "your-app-id-here",
    "remote": true
  }
]
```

That's it for config. The `app_id` maps to a Flagship app you create in the Cloudflare dashboard — that's where you define your flags and targeting rules. `"remote": true` means flag definitions are managed in the dashboard rather than in your codebase.

Add the type to your `Env` interface:

```ts
interface Env {
  FLAGS: Flagship;
}
```

Now `env.FLAGS` is available anywhere in your Worker.

## Evaluating a Flag

The basic API is one function call:

```ts
const isEnabled = await env.FLAGS.getBooleanValue("my-flag", false);
```

Pass the flag key and a default value. It returns `true` or `false`. Gate whatever you want behind it.

Flagship also supports typed methods for other value types:

```ts
await env.FLAGS.getStringValue("theme", "default");
await env.FLAGS.getNumberValue("max-uploads", 5);
await env.FLAGS.getObjectValue("config", {});
```

And if you need the full evaluation result — including the variant, reason, and any error info — use the `Details` variants:

```ts
const result = await env.FLAGS.getBooleanDetails("my-flag", false);
// result.value, result.reason, result.errorCode
```

## User Targeting

The third parameter to `getBooleanValue` is an evaluation context — a plain object of key-value pairs that Flagship uses to match against targeting rules you configure in the dashboard. Passing `userId` and `email` lets you write rules like "enable this flag only for users with this ID" or "roll out to 10% of users, consistently hashed by userId." The rules themselves live in the dashboard — your code just provides the attributes to evaluate against.

```ts
const isEnabled = await env.FLAGS.getBooleanValue(
  "my-flag",
  false,
  { userId: user.id, email: user.email }
);
```

You can then set targeting rules in the dashboard — enable the flag for specific user IDs, match on email patterns, roll out to a percentage of users — all without changing your code or redeploying.

## How I'm Using It in Quick Cuts

In [Quick Cuts](https://quickcuts.app) — a video review and collaboration app built on Cloudflare Workers — I have a single flag called `transcript-generation` that controls access to AI-powered transcript generation for videos. The feature is still in early access, so I want to enable it per user rather than roll it out to everyone at once.

The helper function wrapping the flag evaluation:

```ts
export const TRANSCRIPT_GENERATION_FLAG = "transcript-generation";

export async function isTranscriptGenerationEnabled(
  env: Env,
  user: { id: string; email: string } | null | undefined
): Promise<boolean> {
  if (!user) return false;

  try {
    return await env.FLAGS.getBooleanValue(
      TRANSCRIPT_GENERATION_FLAG,
      false,
      { userId: user.id, email: user.email }
    );
  } catch {
    return false;
  }
}
```

A few things worth noting:

- **Graceful degradation** — any Flagship evaluation error returns `false`. The feature goes off, not the whole app.
- **Single source of truth** — one function, one flag. Four different call sites (the page render, two upload actions, a transcript API action) all go through the same helper.
- **What the flag gates** — the UI checkbox on upload forms, the API action that queues transcript generation, the page-level transcript panel, and the background workflow that runs the actual AI job. One boolean controls all of it.

To enable transcript generation for a user, I flip the flag in the Cloudflare dashboard. No redeploy, no config change, takes five seconds.

## Wrap Up

Flagship is in public beta now, so the API may still evolve — but the core binding is stable and worth trying if you're already on Workers. One thing to keep in mind: targeting rules live entirely in the dashboard, so document them somewhere your team can find them, since your repo won't have that context. And wrap your flag evaluation calls in a try/catch — if Flagship is unavailable for any reason, you want a clean fallback to the default, not an unhandled error taking down a request.

If you're on Workers and want to try it, the [get started guide](https://developers.cloudflare.com/flagship/get-started/) walks through creating your first flag in the dashboard and evaluating it from a Worker.
