---
title: 'Feature Flag Workflow: AI Transcription with Cloudflare Flagship'
slug: feature-flag-workflow-ai-transcription-flagship
pubDate: 2026-05-27T00:00:00.000Z
description: >-
  A walkthrough of how I'd ship an AI transcription feature in Quick Cuts using
  Cloudflare Flagship's JSON object flags — from dashboard setup to gradual
  rollout, without a single extra deploy.
tags:
  - cloudflare
  - typescript
  - javascript
coverImage: ./cover.png
---

[Flagship](https://developers.cloudflare.com/flagship/), Cloudflare's feature flag service, just went into public beta. I've already got a basic implementation in my [Quick Cuts](https://quickcuts.app/) app with a stereotypical boolean flag, but I'm thinking of experimenting with a feature flag as a JSON object.

Instead of a simple on/off toggle, the flag could become the entire configuration for the feature. Here's what that might look like.

## The Feature

For context, Quick Cuts is a video collaboration app where teams upload clips, leave timestamped comments, and review footage together. The feature I'd add: when a user uploads a clip, Quick Cuts automatically generates a transcript.

The goal would be to get this to 100% of users, but not all at once. I'd want to validate transcript quality internally first, expand gradually, and be able to tune or kill the rollout at any point without pushing code.

## Why a JSON Object Flag (Not a Boolean)

You could do this with a boolean flag (`ai-transcription: true/false`) and that works fine, but it doesn't give you any control over _how_ the feature runs.

With a JSON object flag, one evaluation call returns everything your code needs:

- whether the feature is on
- which model to use
- what the file size limit is
- which languages are supported

Then, I could change any of those values in the dashboard without touching code.

## Step 1: Create the Flag (Leave It Disabled)

I'd start by creating the flag in the [Cloudflare dashboard](https://dash.cloudflare.com) before writing any code. Key: `ai-transcription`. I'd define two JSON object variations, but **leave the flag disabled for now**.

**`disabled` (default):**

```json
{
  "enabled": false,
  "model": null,
  "maxFileSizeMb": 0,
  "supportedLanguages": [],
  "showUiHints": false
}
```

**`enabled`:**

```json
{
  "enabled": true,
  "model": "whisper-large",
  "maxFileSizeMb": 500,
  "supportedLanguages": ["en", "es", "fr"],
  "showUiHints": true
}
```

With the flag disabled, it always returns the default variation regardless of any targeting rules. That's exactly what I'd want while the code isn't written yet.

## Step 2: Write the Code

This would be the only code change for the entire rollout. I'd define a TypeScript interface that matches the flag's JSON shape:

```typescript
interface TranscriptionConfig {
  enabled: boolean;
  model: string | null;
  maxFileSizeMb: number;
  supportedLanguages: string[];
  showUiHints: boolean;
}
```

Then evaluate the flag on clip upload. `getObjectValue` takes three arguments: the flag key, a default value to fall back to if evaluation fails, and a context object containing the user attributes that targeting rules will match against.

```typescript
const transcription = await env.FLAGS.getObjectValue<TranscriptionConfig>(
  "ai-transcription",
  { enabled: false, model: null, maxFileSizeMb: 0, supportedLanguages: [], showUiHints: false },
  {
    userId: session.userId,
    plan: session.plan,
    email: session.email,
  }
);
```

Then, I could gate the actual transcript generation on the server:

```typescript
if (transcription.enabled && clip.fileSizeMb <= transcription.maxFileSizeMb) {
  await queueTranscriptionJob(clip.id, transcription.model);
}
```

And in the UI layer to show UI hints:

```typescript
if (transcription.showUiHints) {
  renderTranscriptPanel(clip);
}
```

Because the flag is still disabled in the dashboard, every user — including internal ones — would get the default value with `enabled: false`. Neither `if` condition would trigger. The feature would be live in production but completely inert.

Worth noting: `getObjectValue` never throws. If the flag isn't found, the binding is unreachable, or there's a type mismatch, it returns the default value you passed in. Your app degrades gracefully no matter what.

## Step 3: Enable for Internal Users First

With the code deployed and confirmed safe, I'd go back to the dashboard and enable the flag — but scope it tightly. I'd add a targeting rule that matches internal team members only: `email` contains `@quickcuts.app`.

At this point, only users with a `@quickcuts.app` email would get the `enabled` variation. Everyone else would still get `disabled`. This would be the first time any real user sees the feature running, so I could validate transcript quality, check UI edge cases, and watch queue behavior without any risk to external users.

If something looked wrong, I'd just disable the flag again. No deploy required.

## Step 4: Gradually Roll Out to Everyone

Once internal testing looked good, I'd expand the rollout in stages — all from the dashboard, no code changes.

| Stage  | Who sees it               | What to watch                       |
| ------ | ------------------------- | ----------------------------------- |
| Week 2 | Pro + Enterprise beta users | Error rates, file size edge cases  |
| Week 3 | 20% of all users          | Broader load, language quality      |
| Week 4 | 100%                      | Full rollout                        |

When switching to percentage rollouts, Flagship uses consistent hashing on `userId` so the same user always lands in the same bucket — they wouldn't randomly flip between seeing the feature and not.

I could also tune the `enabled` variation itself mid-rollout without touching code:

- If French transcripts came back garbled → remove `"fr"` from `supportedLanguages`
- If large files started hammering the queue → drop `maxFileSizeMb` from `500` to `200`
- If something went seriously wrong → disable the flag; everyone would immediately fall back to the `disabled` default

That last one is the real value of keeping both code paths live. Rollback would be instant.

## Step 5: Clean Up

Once at 100% and stable, one final code pass to:

- Remove the `getObjectValue` call and the `TranscriptionConfig` interface
- Delete the `disabled` code path
- Archive the `ai-transcription` flag in the dashboard

That would be the second and final deploy for this feature.

## The Practical Outcome

Shipping a feature this way would mean the developer doesn't have to be in the loop for every decision about who sees it.

| Who            | Does what                                    | Requires deploy? |
| -------------- | -------------------------------------------- | ---------------- |
| Developer      | Writes both code paths, adds flag evaluation | Yes (once)       |
| Product / ops  | Creates flag, sets rules, controls rollout   | No               |
| Product / ops  | Expands, adjusts, or kills the rollout       | No               |
| Developer      | Cleans up dead code after full rollout       | Yes (once)       |

Product can expand the rollout on a Saturday. On-call can kill it at 2am without waking anyone up. The developer touches code exactly twice — once to add the feature, once to remove the scaffolding after it's fully live. Everything in between is owned by the dashboard.

If you want to dig into the specifics, the [Cloudflare Flagship docs](https://developers.cloudflare.com/flagship/) and the [binding API reference](https://developers.cloudflare.com/flagship/binding/) are worth a read.
