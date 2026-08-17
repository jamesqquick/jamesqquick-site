---
title: A Beginner's Guide to WebMCP with React
pubDate: 2026-08-17T00:00:00.000Z
description: >-
  Learn WebMCP with React by building browser tools, enabling Chrome support,
  connecting Chrome DevTools MCP, and preparing a bakery order inquiry.
tags:
  - ai
  - react
  - webmcp
  - mcp
coverImage: ./cover.png
---

<!-- Meta: Learn WebMCP with React by building browser tools, enabling Chrome support, connecting Chrome DevTools MCP, and preparing a bakery order inquiry. -->
# A Beginner's Guide to WebMCP with React

I think the days of directly interacting with websites and apps are slowly fading away. MCP servers already enable AI agents to do lots of work for you. Now, with WebMCP, agents can continue to do more by interacting directly with your site in the browser.

Instead of making an agent guess which button to click or which field to fill in, your website can expose clear, structured tools that the agent can discover and call. In this tutorial, you’ll learn how to build a basic tool using WebMCP. Then, I’ll show you an example I added to my personal [bakery site](https://bytheboysbakery.com/).

## What Is MCP?

MCP stands for **Model Context Protocol**. It gives AI applications a consistent way to discover and use tools.

A tool generally includes:
- A name
- A description
- An input schema
- An implementation
- A result

For example, an MCP server might expose a `get_weather` tool. An agent can discover that tool, understand the input it requires, call it with structured arguments, and use the result in its response.

Traditional MCP usually connects an AI client to a backend MCP server. That works well for server-side capabilities, but it can be awkward for interactive web applications. The backend may not know which page the user is viewing, what state is currently in the browser, or which session the user is authenticated with.

## What Is WebMCP?

WebMCP brings the tool idea into the webpage itself. A WebMCP-enabled website registers JavaScript tools in the browser. Those tools can reuse the same client-side functions and state that power the human-facing interface.

The basic flow looks like this:
1. Browser loads a webpage.
2. Webpage registers WebMCP tools.
3. Agent discovers the available tools.
4. Agent chooses an appropriate tool.
5. Browser invokes the tool on the page.
6. Page returns a structured result.

The core API is exposed through `document.modelContext`:
```javascript
await document.modelContext.registerTool(...)
await document.modelContext.getTools()
await document.modelContext.executeTool(...)
```

WebMCP is still experimental as of August 17th, 2026. It is a proposed web standard, so browser support and API details may change.

### What is Chrome DevTools MCP

**Chrome DevTools MCP** is an agent-side MCP server. It lets an MCP-compatible agent control and inspect a live Chrome browser. It can navigate pages, inspect the DOM, read console messages, and discover or execute WebMCP tools.

WebMCP does not automatically connect a website to every AI assistant. You need a browser agent, extension, or browser-control MCP server that supports the WebMCP workflow.

## Enable WebMCP in Chrome

For local development, Chrome currently provides an experimental flag.

1. Open Chrome.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Set **WebMCP Testing** to **Enabled**.
4. Click **Relaunch**.
5. Open your local application.

You can check whether WebMCP is available from the DevTools console:
```javascript
"modelContext" in document
```

The result should be:
```javascript
true
```

You can also inspect the tools registered by the current page:
```javascript
await document.modelContext.getTools()
```

## Connect Chrome DevTools MCP to Your Agent

Chrome DevTools MCP is an MCP server that gives an agent access to a live Chrome browser.

It requires Node.js LTS, Chrome, and an MCP-compatible agent. For ordinary browser inspection, the standard configuration is:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ]
    }
  }
}
```

For this tutorial, WebMCP inspection may also require the experimental WebMCP tool category:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--category-experimental-webmcp"
      ]
    }
  }
}
```

The current Chrome DevTools MCP documentation says this experimental category may require Chrome 150 or newer with WebMCP enabled. If the MCP server launches its own Chrome instance, you can pass the browser feature explicitly:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--category-experimental-webmcp",
        "--chrome-arg=--enable-features=WebMCP"
      ]
    }
  }
}
```

If you are using OpenCode, add the equivalent configuration to `~/.config/opencode/opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "chrome-devtools-mcp@latest",
        "--category-experimental-webmcp"
      ]
    }
  }
}
```

Restart the agent after changing its MCP configuration.

Then try a prompt like:
```plain text
Open http://localhost:5173 and list the available WebMCP tools.
```

If `list_webmcp_tools` is unavailable, check the Chrome version, the WebMCP testing flag, and the experimental MCP category. These APIs are still changing during the browser trial.

Chrome DevTools MCP can inspect and modify the connected browser, so only connect it to an agent and pages you trust.

## Build a React Hello World Tool

Create a React app with Vite:
```bash
npm create vite@latest webmcp-react-demo -- --template react
cd webmcp-react-demo
npm install
npm run dev
```

Now, we’ll go step by step to build a tool.

### Step 1: Check for WebMCP

WebMCP is a browser API, so our app should first check whether the current browser provides `document.modelContext` inside of a `useEffect`. The empty dependency array means this effect runs only when the component mounts.
```javascript
import { useEffect, useState } from "react";

export function HelloWorldTool() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!("modelContext" in document)) {
      return;
    }
  }, []);

  return <p>{message || "Waiting for an agent..."}</p>;
}
```

If WebMCP is unavailable, the effect exits without trying to call an API that does not exist. The rest of the React page can still render normally.

### Step 2: Create Cleanup With AbortController

Tools should not remain registered after the component unmounts. This matters when a user navigates to another route or when React removes the component.

Create an `AbortController` inside the effect and return a cleanup function that aborts it:
```javascript
useEffect(() => {
  if (!("modelContext" in document)) {
    return;
  }

  const controller = new AbortController();

  return () => controller.abort();
}, []);
```

The `AbortController` will be passed to `registerTool` in the next step. Aborting its signal unregisters the tool when the component is cleaned up.

### Step 3: Register the Tool

Now call `document.modelContext.registerTool` and provide the tool definition. This is basically the same as registering a tool with traditional MCP.

The tool needs a name, description, input schema, and `execute` function. The `description` helps the agent understand when the tool is useful. The `inputSchema` tells the agent which arguments to provide. The `execute` function runs inside the webpage and can update React state.
```javascript
useEffect(() => {
  if (!("modelContext" in document)) {
    return;
  }

  const controller = new AbortController();

  void document.modelContext
    .registerTool(
      {
        name: "hello_world",
        title: "Hello World",
        description: "Greets a person by name.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The person's name."
            }
          },
          required: ["name"],
          additionalProperties: false
        },
        execute: async ({ name }) => {
          const result = {
            message: `Hello, ${name}!`
          };

          setMessage(result.message);
          return result;
        }
      },
      {
        signal: controller.signal
      }
    )
    .catch((error) => {
      if (!controller.signal.aborted) {
        console.error("Failed to register hello_world", error);
      }
    });

  return () => controller.abort();
}, []);
```

### Step 4: The Complete Component

Putting the steps together gives us the finished component:
```javascript
import { useEffect, useState } from "react";

export function HelloWorldTool() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!("modelContext" in document)) {
      return;
    }

    const controller = new AbortController();

    void document.modelContext
      .registerTool(
        {
          name: "hello_world",
          title: "Hello World",
          description: "Greets a person by name.",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The person's name."
              }
            },
            required: ["name"],
            additionalProperties: false
          },
          execute: async ({ name }) => {
            const result = {
              message: `Hello, ${name}!`
            };

            setMessage(result.message);
            return result;
          }
        },
        {
          signal: controller.signal
        }
      )
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Failed to register hello_world", error);
        }
      });

    return () => controller.abort();
  }, []);

  return <p>{message || "Waiting for an agent..."}</p>;
}
```

After opening the app in Chrome (by default at `localhost:5173`), ask your agent:
```plain text
Find the hello_world WebMCP tool and call it with the name "James".
```

The tool runs inside the page and updates the React UI.

## My Bakery Example

I run a micro bakery called [By the Boys Bakery](https://bytheboysbakery.com/) in Germantown, Tennessee. I take inquiries for orders (cookies, cupcakes, cakes, etc.) and thought it would be useful to add a tool for this. The form already exists, so converting it to a WebMCP tool is pretty straightforward.

Its inquiry flow asks customers for information such as:
- Name
- Email address
- Phone number
- Occasion
- Needed-by date
- Treats of interest
- Approximate guest count
- Rough budget
- Additional notes

We will start with one imperative WebMCP tool that accepts all of the inquiry fields and submits the inquiry directly. Then, we will adapt the existing form using WebMCP's declarative API.

### Option 1: One Tool That Submits the Inquiry

The tool will reuse the same `submitInquiry` function as the regular React form. Since an inquiry does not take payment or finalize an order, this example submits it directly. The backend still needs to validate the data, rate-limit requests, and protect against spam.

A shared submission function might look like this:
```javascript
async function submitInquiry(values) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    throw new Error("The inquiry could not be submitted.");
  }

  return response.json();
}
```

The `/api/inquiries` URL is illustrative. Replace it with the backend endpoint used by your application. The important part is that the normal form and the WebMCP tool share the same submission logic.

Register one tool that accepts and submits the complete inquiry:
```javascript
useEffect(() => {
  if (!("modelContext" in document)) {
    return;
  }

  const controller = new AbortController();

  void document.modelContext
    .registerTool(
      {
        name: "submit_order_inquiry",
        title: "Submit bakery order inquiry",
        description:
          "Submits a new By the Boys Bakery order inquiry with the customer's contact, event, treat, quantity, budget, and notes information.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The customer's full name."
            },
            email: {
              type: "string",
              description: "The customer's email address."
            },
            phone: {
              type: "string",
              description: "An optional phone number."
            },
            occasion: {
              type: "string",
              description: "The event or reason for the order."
            },
            neededBy: {
              type: "string",
              description: "The date the treats are needed."
            },
            treats: {
              type: "array",
              items: {
                type: "string",
                enum: ["cookies", "brownies", "cupcakes", "cakes"]
              },
              description: "The types of treats the customer is interested in."
            },
            guestCount: {
              type: "string",
              description: "The approximate number of people."
            },
            budget: {
              type: "string",
              description: "The customer's rough budget."
            },
            notes: {
              type: "string",
              description: "Additional flavors, themes, or requests."
            }
          },
          required: ["name", "email", "occasion", "neededBy", "treats"],
          additionalProperties: false
        },
        execute: async (values) => {
          const result = await submitInquiry(values);

          return {
            success: true,
            message: "Bakery inquiry submitted successfully.",
            reference: result.reference
          };
        }
      },
      {
        signal: controller.signal
      }
    )
    .catch((error) => {
      if (!controller.signal.aborted) {
        console.error("Failed to register submit_order_inquiry", error);
      }
    });

  return () => controller.abort();
}, []);
```

A realistic agent prompt would be:
```plain text
Submit a bakery inquiry for:

Name: Alex Smith
Email: alex@example.com
Occasion: Birthday party
Needed by: October 12
Treats: cupcakes and cookies
Guests: 20
Budget: $100-$150
Notes: Please include chocolate and vanilla options.
```

The agent gathers the fields, calls one tool, and receives the backend result. Because this is an inquiry rather than a payment or finalized order, the example does not add a separate confirmation step.

### Option 2: Turn the Existing Form Into a Tool

WebMCP also provides a declarative API for standard HTML forms. Instead of registering a JavaScript tool manually, add attributes to the form and its fields.

The form-level attributes are:
- `toolname`: The tool's name.
- `tooldescription`: What the tool does.
- `toolautosubmit`: Automatically submits the form when the agent invokes it.

Add `toolparamdescription` to fields when the label or field name is not descriptive enough for an agent.

Here is a simplified React form:
```javascript
export function BakeryInquiryForm() {
  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    values.treats = formData.getAll("treats");
    const result = await submitInquiry(values);
    const submitEvent = event.nativeEvent;

    if (submitEvent.agentInvoked) {
      submitEvent.respondWith(
        Promise.resolve({
          success: true,
          message: "Bakery inquiry submitted successfully.",
          reference: result.reference
        })
      );
    }
  }

  return (
    <form
      toolname="submit_order_inquiry"
      tooldescription="Submits a new bakery order inquiry."
      toolautosubmit=""
      onSubmit={handleSubmit}
    >
      <label htmlFor="name">Your Name</label>
      <input name="name" id="name" required />

      <label htmlFor="email">Email Address</label>
      <input name="email" id="email" type="email" required />

      <label htmlFor="occasion">Occasion</label>
      <input
        name="occasion"
        id="occasion"
        required
        toolparamdescription="The event or reason for the order."
      />

      <label htmlFor="neededBy">When do you need it by?</label>
      <input name="neededBy" id="neededBy" type="date" required />

      <label htmlFor="treats">Which treats are you interested in?</label>
      <select
        name="treats"
        id="treats"
        multiple
        required
        toolparamdescription="The types of treats the customer is interested in."
      >
        <option value="cookies">Cookies</option>
        <option value="brownies">Brownies</option>
        <option value="cupcakes">Cupcakes</option>
        <option value="cakes">Cakes</option>
      </select>

      <label htmlFor="guestCount">Approximately how many people?</label>
      <input name="guestCount" id="guestCount" />

      <label htmlFor="budget">Rough budget</label>
      <input name="budget" id="budget" />

      <label htmlFor="notes">Message / Notes</label>
      <textarea name="notes" id="notes" />

      <button type="submit">Send My Inquiry</button>
    </form>
  );
}
```

The browser uses the form fields to synthesize the tool's input schema. When an agent invokes `submit_order_inquiry`, Chrome focuses the form and populates the fields. Because the form includes `toolautosubmit`, it then triggers submission automatically.

The `agentInvoked` property lets the React form distinguish an agent-triggered submission from a normal user submission. `respondWith()` returns a structured result to the agent instead of leaving it with only a navigation or an empty response.

The declarative approach is a good fit when the existing form already contains the right fields and its submit handler is reliable. The imperative approach is more flexible when the action needs custom application logic, computed values, or a non-form UI.

In both versions, keep server-side validation, spam protection, and authorization in place. WebMCP describes how an agent can invoke the action; it is not a replacement for backend security.

## Test the Complete Workflow

Use this checklist:
1. Open the local React bakery demo.
2. Ask the agent to list the page's WebMCP tools.
3. Ask the agent to submit an inquiry with all required fields.
4. Inspect the returned reference or success message.
5. Inspect the browser console and network requests if something fails.

Example prompts:
```plain text
Open my local React bakery demo and list the available WebMCP tools.
```

```plain text
Submit an inquiry for 24 cupcakes for a birthday party next Saturday.
Use my name and email from the form. The budget is $100-$150.
```

For the declarative form version, verify that the agent populates the fields and that `toolautosubmit` triggers the normal React submit handler.

## Wrap-Up

These days, I’m rethinking every interaction a user can have with an app or website. I think a lot less about user experience and a lot more about agent experience. WebMCP is a spec that reinforces this idea.

### References
- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP specification draft](https://webmachinelearning.github.io/webmcp/)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [By the Boys Bakery](https://bytheboysbakery.com/)
- [By the Boys Bakery inquiry form](https://bytheboysbakery.com/inquiry)
