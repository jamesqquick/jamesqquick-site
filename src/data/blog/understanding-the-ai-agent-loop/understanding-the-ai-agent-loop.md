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

Like most people, I'm building every day with AI, but have you ever wondered what exactly happens when you send a prompt to ChatGPT, Claude Code, OpenCode, etc? How does it make decisions? How does it know when it's done?

In this article, let's take a specific look at the "agent loop" and how it works. We'll do this by progressively building a simple code demo to represent the loop. Note, the code snippets are for demo purposes only and may not be fully functioning in isolation.

## Start With a Basic LLM Call

The easiest place to start is with a single call to an LLM. You send a message, the model sends back a response.

```typescript
const response = await callLLM({
  messages: [{ role: "user", content: "What's the weather in Austin?" }],
});

console.log(response.text);
// "I'm not sure, I don't have access to real-time data."
```

This works fine for answering general questions, but the model can't actually do anything. It can only respond based on what it already knows.

## Give the Model Tools

LLMS become much more useful when they have things that they can do. For example:

- do fresh research
- call external APIs
- create files

In the agentic world, most of these actions are defined as "tools". These can be functions that you define yourself or they can be defined remotely and accessed via an MCP server. Regardless, the LLM needs to know the list of tools it has access to so it knows what actions it can take.

In this demo, we'll stick with locally defined tools for simplicity and avoid the complexity of talking to an MCP server. This doesn't change the core concept of the LLM needing to receive a list of tools. So, in this snippet, we'll pass the tools array to the LLM.

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

const response = await callLLM({
  messages: [{ role: "user", content: "What's the weather in Austin?" }],
  tools,
});

console.log(response.tool_calls);
// [{ name: "get_weather", input: { location: "Austin" } }]
```

Now, based on the question about the weather in Austin, the LLM can look at the list of tools and decide that it would make sense to call the `get_weather` tool since the user is asking about weather.

Here's the important thing to understand, though. The model doesn't actually call `get_weather` itself. It just says that based on the inputs it received, it wants to call the specific tool.

Therefore, there's a gap between deciding a tool should be used and actually running the tool. Additional code is needed for actually running it.

## Handle the Tool Call

Now we need to check whether the model requested a tool, and if so, run it. We can do this by inspecting the response from the LLM. If the response includes a `stop_reason` of `"tool_use"`, for example, we call the tool to get the result.

```typescript
//...
// call LLM
//...

if (response.stop_reason === "tool_use") {
  const { name, input, id } = response.tool_calls[0];
  const result = await runTool(name, input);
}
```

This works, but we're not actually doing anything with the result. It needs to be passed back to the LLM in a loop until the LLM decides it's done. This is where the loop comes in.

## Adding the Loop

Each iteration of the loop should pass the latest result back into a new call to the LLM. The loop would continue until the LLM decides that its work is done.

We'll initialize an array of messages before the loop so that we can add to it as we iterate through the loop. This messages array is what gives the agent memory through the course of the loop.

Then, inside the loop, we move the call to the LLM and pass both the tools and messages array. Lastly, we add the result into the messages array with `role` of `"assistant"`.

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

const messages = [{ role: "user", content: "What's the weather in Austin?" }];

while (true) {
  const response = await callLLM({
    messages,
    tools,
  });

  // Add the model's response to the conversation history
  messages.push({ role: "assistant", content: response.content });
}
```

Finally, we can check the response itself to do two things. First, we'll handle tool calls similar to what we did above. This time, though, we also add the tool call results back to the messages array.

Second, we check for a condition to break out of our loop. We can base this on a `stop_reason` of `"end_turn"`.

```typescript
//in the loop after pushing the LLM response into the messages array

// If the model is done, return the final text
if (response.stop_reason === "end_turn") {
  return response.text;
}

//Check on tool calls and add the results
if (response.stop_reason === "tool_use") {
  const { name, input, id } = response.tool_calls[0];
  const result = await runTool(name, input);

  messages.push({ role: "user", content: result });
}
```

If we put it all together into a function called `runAgentLoop`, it might look like this.

```typescript
async function runAgentLoop(userMessage: string) {
  const messages = [{ role: "user", content: userMessage }];

  while (true) {
    const response = await callLLM({ messages, tools });

    // Add the model's response to the conversation history
    messages.push({ role: "assistant", content: response.content });

    // If the model is done, return the final text
    if (response.stop_reason === "end_turn") {
      return response.text;
    }

    if (response.stop_reason === "tool_use") {
      const { name, input, id } = response.tool_calls[0];
      const result = await runTool(name, input);

      messages.push({ role: "user", content: result });
    }
  }
}
```

That's the agent loop. The model runs, you execute whatever it asks for, feed the results back in, and keep going until it returns `"end_turn"`. The conversation history grows with each round. That's what lets the model reason across multiple steps and remember what it's already done.

## What Makes Something an "Agent"

A single LLM call answers questions. The loop is what makes something an agent. It can plan, act, observe what happened, and decide what to do next.

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
