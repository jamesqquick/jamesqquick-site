---
title: "Cloudflare Flagship: Feature Flags Built Into Workers"
slug: cloudflare-flagship-feature-flags-workers
pubDate: 2026-05-26T00:00:00.000Z
description: >-
  Cloudflare Flagship is now in public beta offering native feature flags for Workers
  with no SDK or third-party service required. Here's what the setup looks like
  and how I'm using it in a real app.
tags:
  - cloudflare
  - typescript
  - javascript
coverImage: ./cover.png
---

I've been wanting to try Cloudflare Flagship since it was announced, and now that it's in public beta I finally have a good excuse. I added it to [Quick Cuts](https://quickcuts.app) recently and the setup was surprisingly fast. What's nice is that if you're already building on Workers, you don't need a third-party feature flag service for this.

## What Is Flagship?

Flagship is Cloudflare's feature flag service. You define flags in the Cloudflare dashboard and evaluate them inside your Workers through a native binding. No outbound HTTP calls to a third-party API, no extra SDK to install, no separate vendor to manage.

Flags support:

- Boolean, string, number, and object values
- Targeting rules based on user attributes (11 comparison operators, AND/OR grouping)
- Percentage-based rollouts with consistent hashing
- Audit history in the dashboard

It's also [OpenFeature](https://openfeature.dev/) compatible. OpenFeature is a CNCF open standard that defines a vendor-agnostic API for feature flag evaluation, so you can swap providers without rewriting your flag calls. That means you can use the `@cloudflare/flagship` SDK from Node.js or the browser if you need to evaluate flags outside of Workers.

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

The `app_id` maps to a Flagship app you create in the Cloudflare dashboard, where you define your flags and targeting rules. `"remote": true` means flag definitions are managed in the dashboard rather than in your codebase. You may or may not want this while running locally.

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

Pass the flag key and a default value. It returns `true` or `false`. Flagship also supports typed methods for other value types:

```ts
await env.FLAGS.getStringValue("theme", "default");
await env.FLAGS.getNumberValue("max-uploads", 5);
await env.FLAGS.getObjectValue("config", {});
```

And if you need the full evaluation result, including the variant, reason, and any error info, use the `Details` variants:

```ts
const result = await env.FLAGS.getBooleanDetails("my-flag", false);
// result.value, result.reason, result.errorCode
```

## User Targeting

The third parameter to `getBooleanValue` is an evaluation context. It's a plain object of key-value pairs that Flagship matches against targeting rules you configure in the dashboard. Passing `userId` and `email` lets you write rules like "enable this flag only for users with this ID" or "roll out to 10% of users, consistently hashed by userId." The rules live in the dashboard. Your code just provides the attributes to evaluate against.

```ts
const isEnabled = await env.FLAGS.getBooleanValue(
  "my-flag",
  false,
  { userId: user.id, email: user.email }
);
```

You can enable the flag for specific user IDs, match on email patterns, or roll out to a percentage of users, all without changing your code or redeploying.

## How I'm Using It in Quick Cuts

[Quick Cuts](https://quickcuts.app) is a video review and collaboration app I built on Cloudflare Workers. I have a single flag called `transcript-generation` that controls access to AI-powered transcript generation for videos. The feature is still in early access, so I want to enable it per user rather than roll it out to everyone at once.

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

A few things I like about this pattern:

- If Flagship throws for any reason, the catch block returns `false` and the feature goes off cleanly. The app keeps running.
- Four call sites (the page render, two upload actions, a transcript API action) all go through the same helper. One place to change if the flag name ever changes.
- That one boolean gates the UI checkbox, the API action that queues transcript generation, the page-level transcript panel, and the background workflow. 

To enable transcript generation for a user, I flip the flag in the dashboard. No redeploy.

## Wrap Up

Flagship is in public beta, so the API may still evolve, but the core binding is stable. One thing to keep in mind: targeting rules live entirely in the dashboard, so document them somewhere your team can find them if they don't all have access to the dashboard. Your repo won't have that context. Also wrap your flag evaluation calls in a try/catch. If Flagship is unavailable, you want a clean fallback to the default, not an unhandled error.

If you want to try it, the [get started guide](https://developers.cloudflare.com/flagship/get-started/) walks through creating your first flag and evaluating it from a Worker.
