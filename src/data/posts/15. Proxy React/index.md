---
title: Configure Proxy in React
slug: /blog/configure-proxy-in-react
publishDate: "2020-02-14"
tags: web-development, javascript, react
published: true
coverImage: ../covers/placeholder-cover.jpg
---

So you're working on a full-stack app, React on the frontend and...well anything else on the backend. Your Single Page Applications (SPAs) will have to interact with your backend through API/HTTP requests.

## The Problem

When you publish your app, you have two options.

1. backend serves your frontend
2. backend and frontend hosted separately (you will need to configure [COORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for this to work)

However, in development, it's much much (did I say much?!) easier to run your frontend React app separate from your backend. For this to work, though, you'll need to make cross-origin requests since they are running on different ports. For example, by default Create React Apps run on port 3000, and your backend server might run on 8000. To allow this to work in development, you can set up a proxy in your React app.

## The Solution

To solve this problem, we can configure a proxy in the `package.json` file of the React project. This allows the app to "pretend" it is making requests from the same port of the server.

> [Official docs on proxying](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

To configure the proxy, you'll need to add the following line to your `package.json`.

```json
"proxy": "http://localhost:<SERVER_PORT_NUMBER>",
```

Then, in your React app, you can make API requests by using relative paths. For example, `http://localhost:8000/api/todos` becomes `/api/todos`.

Now, you should be able to run your frontend and backend separately during development, while making API requests using relative paths.
