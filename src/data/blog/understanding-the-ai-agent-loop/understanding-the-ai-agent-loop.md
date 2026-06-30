---
title: "Understanding the AI Agent Loop"
slug: understanding-the-ai-agent-loop
pubDate: 2026-06-30T00:00:00.000Z
description: >-
  Every AI agent is built on the same simple pattern: call the model, run the tools it
  requests, and repeat. Here's how to build that loop from scratch, step by step.
coverImage: ./cover.png
tags:
  - ai
  - typescript
  - javascript
---

I've been building a lot of AI-powered features lately, and the same question keeps coming up: how does an AI agent actually *work*? Not in a hand-wavy "it uses LLMs" way — but mechanically, what's happening under the hood?

The answer is simpler than most people expect. Every agent, no matter how sophisticated, runs on the same core pattern. Once you see it, you'll understand why so much of the "agentic AI" hype isn't magic — it's just a while loop.

## Start With a Basic LLM Call

Before there's an agent, there's a single call. You send a message, the model sends back a response.

```typescript
const response = await llm.call({
  messages: [{ role: "user", content: "What's the weather in Austin?" }],
});

console.log(response.text);
// "I'm not sure, I don't have access to real-time data."
```

This works fine for answering general questions. But the model can't actually *do* anything — it can only respond based on what it already knows. That's the ceiling for a plain chat model.

## Give the Model Tools

You can define tools and pass them along with your request. A tool is just a structured description of something the model can ask you to execute on its behalf.

```typescript
const tools = [
  {
    name: "get_weather",
    description: "Get current weather for a city",
    parameters: {
      location: { type: "string" },
    },
  },
];

const response = await llm.call({
  messages: [{ role: "user", content: "What's the weather in Austin?" }],
  tools,
});

console.log(response.tool_calls);
// [{ name: "get_weather", input: { location: "Austin" } }]
```

Here's the important thing to understand: **the model doesn't call `get_weather` itself.** It just says "I want to use this tool with these inputs." Your code is responsible for actually running it. The model is making a request, not taking an action.

## Handle the Tool Call

Now you need to check whether the model requested a tool, run it, and send the result back so the model can continue.

```typescript
if (response.stop_reason === "tool_use") {
  const { name, input, id } = response.tool_calls[0];

  // You run the actual function
  const result = await runTool(name, input);

  // Send the result back to the model
  const followUp = await llm.call({
    messages: [
      { role: "user", content: "What's the weather in Austin?" },
      { role: "assistant", content: response.content },
      { role: "user", content: toolResult(id, result) },
    ],
    tools,
  });

  console.log(followUp.text);
  // "The weather in Austin is 72°F and sunny."
}
```

This works — but only for a single tool call. What if the model calls two tools in sequence? What if the second response also triggers a tool? You'd need to handle that too. And that's exactly what the loop is for.

## Write the Loop

Instead of hard-coding one round-trip, you loop until the model signals it's done.

```typescript
async function runAgent(userMessage: string) {
  const messages = [{ role: "user", content: userMessage }];

  while (true) {
    const response = await llm.call({ messages, tools });

    // Add the model's response to the conversation history
    messages.push({ role: "assistant", content: response.content });

    // If the model is done, return the final text
    if (response.stop_reason === "end_turn") {
      return response.text;
    }

    // Run all requested tools and collect results
    const results = await Promise.all(
      response.tool_calls.map(async ({ name, input, id }) => {
        const result = await runTool(name, input);
        return toolResult(id, result);
      })
    );

    // Feed results back into the conversation
    messages.push({ role: "user", content: results });
  }
}
```

That's the agent loop. The model runs, you execute whatever it asks for, feed the results back in, and keep going until it returns `"end_turn"`. The conversation history grows with each round — that's what lets the model reason across multiple steps and remember what it's already done.

## What Makes Something an "Agent"

A single LLM call answers questions. The loop is what makes something an agent — it can plan, act, observe what happened, and decide what to do next.

Give it tools like a search API, a database query function, or a browser, and it can complete multi-step tasks on its own. The loop doesn't care how many steps it takes. The model decides when it's done.

A couple of things worth adding before you ship this in production:

- **Max iteration limit** — cap the loop at some reasonable number (10-20 iterations) so a confused model can't run forever.
- **Error handling around `runTool`** — if a tool throws, decide whether to surface that error to the model or bail out entirely.

Beyond that, you've got the foundation. Everything in the "agentic AI" space — memory, planning, multi-agent coordination — is built on top of this same basic loop.

---

**Key takeaways:**

- The model doesn't run tools — it requests them. Your code runs them.
- Conversation history is what gives the model context across multiple steps.
- `stop_reason === "end_turn"` is your exit condition.

If you want to see this pattern in a real project, I've been building out some agent-powered tools using the Anthropic SDK — I'll have more on that soon.
