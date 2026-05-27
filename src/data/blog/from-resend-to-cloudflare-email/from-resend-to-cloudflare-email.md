---
title: From Resend to Cloudflare Email
slug: from-resend-to-cloudflare-email
pubDate: 2026-05-21T12:00:00.000Z
description: >-
  I migrated my personal site's transactional email from Resend to Cloudflare
  Email Service. Here's exactly what changed and what stayed the same.
tags:
  - cloudflare
  - email
  - astro
coverImage: ./cover.png
---

I joined Cloudflare recently, and I've been actively trying to migrate my products to get real hands-on experience, provide feedback, and consolidate my tech stack. One of the latest additions is using [Cloudflare Email](https://developers.cloudflare.com/email-service/) for transactional emails.

Previously, I was using Resend on my personal site for sending transactional emails when someone fills out my speaking inquiry form. Here's how I migrated this to using Cloudflare Email.

## A Note on Resend

First, I want to say I'm a huge fan of Resend, the product and the team. I know several people that work there, and they're amazing. Me moving away is more about trying my company's product than anything negative about Resend.

It's also worth noting that Resend's platform has more functionality than Cloudflare's at this point. Since my use case is simple, it's not a problem. If you're considering moving, make sure Cloudflare supports the feature set you need.

Just wanted to clarify before moving on.

## Existing Setup with Resend

Email lived in `src/utils/emailer.ts`, which initialized a Resend client and exported a `sendEmail` function for transactional sends.

```typescript
// emailer.ts (before)
import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from "astro:env/server";

let resend: Resend | null = null;

const getResendClient = () => {
  if (!resend) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
};

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  await getResendClient().emails.send({
    to: "me@jamesqquick.com",
    from: "speaking@jamesqquick.com",
    replyTo: fromEmail,
    subject,
    text,
  });
};
```

The speaking form endpoint (`/api/speaking`) calls `sendEmail()` when someone submits a speaker request. Pretty simple. Now let's see what it looks like with Cloudflare.

## Adding the Cloudflare Email Binding

Cloudflare Email Service uses a Workers binding instead of an API key. You declare it in `wrangler.jsonc`. Defining these bindings is different from many tools I've worked with before, but the more I've learned about them, the more powerful and useful I find them.

Here's the binding for adding email support:

```json
// wrangler.jsonc
{
  "send_email": [
    {
      "name": "EMAIL"
    }
  ]
}
```

The binding then becomes available as `env.EMAIL` inside your Worker at runtime. No secrets to rotate, no SDK to import, no HTTP calls to an external service. It's actually pretty neat.

For this to work, your sending domain needs to be onboarded first. If you haven't done that yet:

```bash
npx wrangler email sending enable yourdomain.com
```

## Updating the Emailer

With the binding in place, `sendEmail` becomes much simpler. The Resend client initialization, the API key check, and the SDK import. All of it goes away for the transactional send path:

```typescript
// emailer.ts (after)
import { env } from "cloudflare:workers";

export const sendEmail = async (
  fromEmail: string,
  text: string,
  subject: string
) => {
  await env.EMAIL.send({
    to: "me@jamesqquick.com",
    from: "speaking@jamesqquick.com",
    replyTo: fromEmail,
    subject,
    text,
  });
};
```

The call signature for `env.EMAIL.send()` is essentially the same shape as Resend's (`to`, `from`, `replyTo`, `subject`, `text`, `html`). The swap in the actual send call is nearly one-for-one.

The speaking form endpoint itself (`src/pages/api/speaking.ts`) didn't need to change at all, since it just calls `sendEmail()`. That's the beauty of extracting implementation into utility functions.

## The Result

It works and it's simple. Honestly, that's the main takeaway. The diff is small but the outcome is a little cleaner — one fewer API key to manage, one fewer external dependency in the runtime path.

**Key takeaways:**

- Add `send_email` to `wrangler.jsonc` and onboard your domain with `wrangler email sending enable`
- Replace `resendClient.emails.send()` with `env.EMAIL.send()` — the shape is nearly identical
- Cloudflare Email is transactional-only; keep Resend (or another tool) if you need audience/contact management
