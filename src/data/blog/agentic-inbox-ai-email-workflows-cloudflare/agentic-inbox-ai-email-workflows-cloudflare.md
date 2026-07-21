---
title: "I Built an AI Email Client That Runs Workflows From My Phone"
pubDate: 2026-07-21T00:00:00.000Z
description: >-
  I built a self-hosted email client on Cloudflare Workers where subject line tags trigger full AI workflows — Notion entries, web research, summaries — from anywhere you can send a text or email.
coverImage: ./cover.png
tags:
  - ai
  - cloudflare
  - typescript
  - cloudflare-workers
  - agents
---

I had a shower thought a few months ago: email is already on every device I own. So is texting. Why am I opening apps to capture ideas when I could just... send myself a message?

That question turned into the Agentic Inbox — a self-hosted email client where the subject line is a command. You send an email or text with `[VIDEO]` in the subject and a URL in the body, and a few seconds later there's a fully structured Notion content item waiting for you, complete with AI-generated direction options. No app switching. No friction. Just a message from wherever you are.

## Email and Text Are Already the Universal Input Layer

Before getting into how it's built, I want to make the case for why this pattern matters.

Most AI tools require you to go somewhere — open a browser, fire up an app, navigate to the right screen. That works fine at a desk. It falls apart when you're between meetings, in the car, or just have a thought at 10pm and don't want to context-switch.

Email and texting don't have that problem. They're on every device, work offline, and require zero onboarding. The insight is that if you put your AI workflows behind an email address or a phone number, you get that reach for free. Whatever device you're on, you can kick off the full pipeline with a send.

The Agentic Inbox is built on top of that idea. It runs entirely on Cloudflare Workers — one deploy covers the email client, the AI layer, and the web interface.

## How the Subject Tag System Works

Every inbound email gets checked against a single regex:

```typescript
const TAG_REGEX = /^\[([a-zA-Z][a-zA-Z0-9_]*)\]\s*/;

export function parseSubjectTag(subject: string) {
  const match = subject.match(TAG_REGEX);
  if (!match) return null;
  return {
    tag: match[1].toUpperCase(),
    cleanSubject: subject.slice(match[0].length),
  };
}
```

If the subject starts with `[WORD]`, that word gets extracted as the tag and routed to its handler. After the handler runs, the email automatically moves to a folder named after the tag and gets marked as read.

The full tag registry covers content creation, research, and bookmarking:

- `[VIDEO]`, `[BLOG]`, `[SHORT]`, `[IDEA]`, `[TWITTER]`, `[LINKEDIN]` — content idea capture
- `[SUMMARY]` — summarize a URL and email the result back
- `[RESOURCE]` — extract structured metadata from a URL and save to Notion
- `[CFP]` — parse a conference proposal page, brainstorm talk ideas, save to Notion

Adding a new tag takes three steps: create a handler file, add the tag-to-handler entry in the registry, and start sending emails. The regex handles everything else.

## The Content Idea Pipeline

The content idea handlers are the ones I use most. When you send `[VIDEO] <some URL>`, here's what happens:

1. The URL is extracted from the email body
2. Browser Run renders the linked page and returns it as Markdown
3. Workers AI generates a title and description from that content
4. A second AI pass brainstorms four distinct direction options
5. All of that lands in a new Notion page at Status = Idea
6. A confirmation reply comes back with a direct link to the Notion entry

The whole thing takes about 20 seconds. By the time you've put your phone down, the idea is captured and scaffolded — not just dumped as a raw note.

`[BLOG]`, `[SHORT]`, `[TWITTER]`, and `[LINKEDIN]` all run the same pipeline. The only difference is which Notion category gets assigned to the item.

`[SUMMARY]` is simpler: paste a URL, get an AI-written summary emailed back. I use it when I want to quickly understand something without reading the full article.

`[RESOURCE]` and `[CFP]` use Browser Run's structured JSON extraction rather than plain Markdown. Instead of raw text, you get typed fields back — resource type, category, tags for resources; deadline, content types, and talk ideas for conference proposals.

## What Happens to Emails Without a Tag

Not every email is a command. Regular emails — the ones without a `[TAG]` prefix — go to the EmailAgent instead.

The EmailAgent is a Durable Object built on the Cloudflare Agents SDK. The moment a new email lands, it reads the full thread, loads context, and auto-drafts a reply:

```typescript
const result = await generateText({
  model: workersai("@cf/moonshotai/kimi-k2.5"),
  system: systemPrompt,
  messages: await convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(5),
});
```

It never sends without you confirming. The draft sits in your Drafts folder until you review and approve it from the UI. You can also open the chat interface and talk to it directly — "what emails need a response today," "move all unread newsletters to archive," that kind of thing.

## Closing the Loop with Notifications

Capturing ideas is only half the problem. The other half is making sure they don't disappear into a database and get forgotten.

A daily cron job queries Notion for everything still at Status = Idea, then sends an email digest:

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

The `channel` array is the interesting part — sent.dm handles the routing. You pass SMS, WhatsApp, and RCS and Sent figures out which one reaches that recipient best. Carrier routing, formatting, fallbacks, and compliance all happen on their side. The code stays the same regardless of which channel actually delivers.

The SMS is additive. If you don't configure sent.dm, the email digest still runs. But if you do set it up, you get a text nudge every morning that surfaces your open ideas — on the same device where you probably captured them in the first place.

## The Stack

Everything runs on a single Cloudflare Workers deploy:

- **Cloudflare Email Routing** — receives inbound email
- **Durable Objects** — per-mailbox SQLite storage for emails, folders, and threads
- **R2** — email attachment storage
- **Workers AI** — title generation, summarization, direction brainstorming
- **Browser Run** — renders pages and extracts structured content
- **Notion API** — stores content items, CFPs, and resources
- **Cloudflare Email Service** — outbound confirmation replies
- **sent.dm** — multi-channel SMS/WhatsApp/RCS nudges
- **React + React Router** — the email client UI, server-rendered from the same Worker

---

**Key takeaways:**

- Email and text are universal input layers — they work from anywhere, on any device, with no new habit required
- A single regex and a tag registry are all you need to route emails to AI workflows
- The Workers ecosystem handles all the heavy lifting: AI, storage, browser automation, notifications

The repo is open source. If you build a new handler — `[RECIPE]`, `[TICKET]`, `[TWEET]` — I'd love to see it.

→ [GitHub repo](https://github.com/jamesqquick/jqq-agentic-inbox)
→ [sent.dm](https://sent.dm)
