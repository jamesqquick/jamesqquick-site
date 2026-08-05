---
title: "Here's How I Trigger My AI Agent From My Phone"
pubDate: 2026-07-21T00:00:00.000Z
description: >-
  I built a Cloudflare Worker to trigger full AI workflows for content generation, triggered by text or email.
coverImage: ./cover.png
tags:
  - ai
  - cloudflare
  - typescript
  - cloudflare-workers
  - agents
---

The hardest part about building semi-automated workflows with AI is figuring out how to trigger them. For me, I come up with ideas all the time while I'm on the move. I don't have immediate access to my laptop, but I don't want to lose the idea. I want to easily submit the idea and have a workflow kick off to take it to the next level.

I realized that email and texts are the two easiest ways to do that. I have my phone with me 24/7 (obviously), and I text and email every day. So why not use that as the input?

Well, I took that idea and turned it into AI workflows for content generation. For example, if I have an idea for a YouTube video, I just send an email or text with the tag `[VIDEO]`, and the workflow kicks off from there.

## The Tech Stack

The initial inspiration for this project was the [agentic inbox](https://github.com/cloudflare/agentic-inbox) repo from Cloudflare. This repo has everything you need to quickly deploy to Cloudflare and get:

- a traditional email inbox UI
- an MCP server
- a chat agent
- AI generated draft responses

Everything runs on a single Cloudflare Workers deploy:

- **Cloudflare Email Routing** — receives inbound email
- **Durable Objects** — per-mailbox SQLite storage for emails, folders, and threads
- **R2** — email attachment storage
- **Workers AI** — title generation, summarization, direction brainstorming
- **Browser Run** — renders pages and extracts structured content
- **Notion API** — stores content items, CFPs, and resources
- **Cloudflare Email Service** — outbound confirmation replies
- **React + React Router** — the email client UI, server-rendered from the same Worker

The coolest thing about this is that, since it's open source, you can customize this any way you want. This is what allowed me to do two things:

- create a custom tag system to trigger workflows based on email subject
- receive webhooks to also trigger different workflows

To use text messages to trigger a webhook, I'm using [Sent.dm](https://sent.dm/). Pretty quickly, I'm able to register a phone number and forward a text message received event to my applications webhook.

## How the Subject Tag System Works

Every inbound message (email or text) gets checked against a single regex to attempt to parse a tag:

```typescript
const TAG_REGEX = /^\[([a-zA-Z][a-zA-Z0-9_]*)\]\s*/;

export function parseeTag(text: string) {
  const match = text.match(TAG_REGEX);
  if (!match) return null;
  return {
    tag: match[1].toUpperCase(),
    cleanSubject: text.slice(match[0].length),
  };
}
```

If the text starts with `[WORD]`, that word gets extracted as the tag and routed to its handler. For emails, after the handler runs, the email automatically moves to a folder named after the tag and gets marked as read.

The full tag registry covers content creation, research, and bookmarking:

- `[VIDEO]`, `[BLOG]`, `[SHORT]`, `[IDEA]`, `[TWITTER]`, `[LINKEDIN]` — content idea capture
- `[SUMMARY]` — summarize a URL and email the result back

Adding a new tag takes three steps: create a handler file, add the tag-to-handler entry in the registry, and start sending emails or texts. The tag parsing handles everything else.

## The Content Idea Pipeline

The content idea handlers are the ones I use most. When I send `[VIDEO] <some URL>`, here's what happens:

1. The URL is extracted from the text body
2. [Browser Run](https://developers.cloudflare.com/browser-run/) renders the linked page and returns it as Markdown
3. [Workers AI](https://www.cloudflare.com/products/workers-ai/) generates a title and description from that content
4. A second AI pass brainstorms four distinct direction options
5. All of that lands in a new Notion page at with a status of `Idea`
6. A confirmation reply comes back with a direct link to the Notion entry

The whole thing takes about 20 seconds. By the time I've put your phone down, the idea is captured and scaffolded.

`[BLOG]`, `[SHORT]`, `[TWITTER]`, and `[LINKEDIN]` all run the same pipeline. The only difference is which Notion category gets assigned to the item.

`[SUMMARY]` is simpler: paste a URL, get an AI-written summary emailed back. I use it when I want to quickly understand something without reading the full article.

## Closing the Loop with Notifications

Capturing ideas is only half the problem. The other half is making sure they don't disappear into the database and get forgotten. I wanted to send myself daily status updates to know what content I have in the backlog that I need to work on.

For this, I created a daily cron job to query Notion and generate a digest.

```typescript
await sendEmail(env.EMAIL, {
  to: DIGEST_RECIPIENT,
  from: DIGEST_SENDER,
  subject: `Morning Digest — ${items.length} ideas ready`,
  text: textBody,
  html: htmlBody,
});
```

And then an SMS nudge via [sent.dm](https://sent.dm) (who sponsored this post) with the count:

```typescript
await client.messages.send({
  to: [params.to],
  template: { id: params.templateId, parameters: params.parameters },
  channel: ["sms", "whatsapp", "rcs"],
});
```

Although, Im using sms messages, [sent.dm](https://sent.dm/) supports SMS, WhatsApp and RCS and automatically handles routing, formatting, fallbacks, and compliant. The `channel` array allows me to determine which methods I need to support. My code stays the same regardless of which channel actually delivers.

**Key takeaways:**

- Email and text are universal input layers — they work from anywhere, on any device, with no new habit required
- A single regex and a tag registry are all you need to route emails to AI workflows
- The Workers ecosystem handles all the heavy lifting: AI, storage, browser automation, notifications

The repo is open source. If you build a new handler — `[RECIPE]`, `[TICKET]`, `[TWEET]` — I'd love to see it.

→ [GitHub repo](https://github.com/jamesqquick/jqq-agentic-inbox)
→ [sent.dm](https://sent.dm)
