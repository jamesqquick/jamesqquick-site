---
title: How to Add OpenAI To Your Nextjs Project
slug: add-openai-nextjs-project
coverImage: ./images/add-openai-nextjs-project/ChatGPT Nextjs.jpg
pubDate: 2023-05-04T15:06:49.228Z
description: Learn how to incorporate AI into your Next project using the openAI SDK.
youTubeVideoId: 2xwv4T552lM
tags:
  - nextjs
---

Everyone is talking about AI, and as a developer, you don't want to be left behind. So let's look at the easiest way you can include AI features like ChatGPT directly inside your Next.js application using the OpenAI SDK.

> This tutorial is heavily influenced by videos from Colby Fayock. Check out his amazing for his recent video on [creating a Star Wars trivia game with ChatGPT](https://www.youtube.com/watch?v=bYDLxzC16XA).

## Initial Setup

For this demo, you will need an account with [OpenAI](https://www.openai.com) and an API key. Log in to the OpenAI platform and [create an API key ](https://platform.openai.com/account/api-keys) if you don't have one already. Copy this to your clipboard or leave the tab open. You’ll need this in a second.

**_Setting Up the Next.js Project_**

1. Start by creating a new Next.js project:

   ```null
   npx create-next-app your-project-name
   cd your-project-name

   ```

**_Configuring OpenAI SDK_**

1. First, you need to install the OpenAI package:

   ```
   npm install openai

   ```

2. Create an environment variable file named `.env` in the root of your project and add the API key:

   ```
   OPENAI_API_KEY=<YOUR_API_KEY>

   ```

3. Create a `utils` directory and an `openAI.ts` file inside it with the following code to configure the OpenAI SDK:

   ```typescript
   import { OpenAIApi, Configuration } from "openai";

   const configuration = new Configuration({
     apiKey: process.env.OPENAI_API_KEY,
   });

   const openAI = new OpenAIApi(configuration);

   export default openAI;
   ```

   We'll now be able to use this configured object inside of our API endpoint.

## Creating the API Endpoint

Because we need to safely refer to our API key, we’ll need to run all code interacting with openAI on the server. For this, we’ll use API endpoints.

Inside the `pages/api` directory, open the `hello.ts` file (or create a new file) and make the following changes:

- Import the OpenAI object from the `openAI.ts` file
- Make the function `async`

Inside of the handler function, we'll generate a response from OpenAI by calling `openAI.createCompletion` like so.

```typescript
const response = await openAI.createCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "What is 2+2",
    },
  ],
});
```

Notice that we are using the `gpt-3.5-turbo` model and we are passing the prompt through the `messages` property which takes an array of objects, each one including `role` and the `content`.

From there, we'll need to parse the response and return it to the caller:

```typescript
const responseText = response.data.choices[0]?.message.content;
res.status(200).json({ response: responseText });
```

Start your server by running:

```
npm run dev
```

You can test your API endpoint by visiting [http://localhost:3000/api/hello](http://localhost:3000/api/hello) in your web browser.

**_Improving the AI Integration_**

From here, you can customize your prompt to ask for any type of completion that you want. In this example, I'm using it to generate text to be used on a JavaScript related meme.

```typescript
const response = await openAI.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "Can you generate text for a meme related to JavaScript?",
    },
  ],
});
```

To get even better results, we can add more context. For example, we can clarify a few things.

- a description of the image to be used
- two separate pieces of text for the top and bottom of the meme
- the format of the response in JSON

```typescript
const response = await openAI.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content:
        "Can you generate text for a meme related to JavaScript for an image of a confused person holding their hand out? The meme should have two pieces of text, one on the top and one on the bottom, each piece of text should be less than 25 characters long. Lastly, can you format the response as JSON with the two properties named 'topText' and 'bottomText'?",
    },
  ],
});
```

This should now return a JSON object with two properties, `topText` and `bottomText`.

Here's an example of how I used this in my personal meme generator 🤣

![Meme with text "JavaScript bugs or is it just me?"](/images/posts/add-openai-nextjs-project/1.jpg)

## Conclusion

Incorporating AI features into your Next.js application is simple and opens up endless possibilities for developing powerful applications. By using the OpenAI SDK, you can easily create custom API endpoints to interact with AI models like ChatGPT, allowing you to generate content based on specific context and format. Building AI-powered applications has never been easier!
