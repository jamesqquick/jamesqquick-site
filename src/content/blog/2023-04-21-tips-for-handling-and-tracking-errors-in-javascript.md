---
title: Tips For Handling and Tracking Errors in JavaScript
slug: tips-handling-tracking-errors-javascript
coverImage: /images/posts/tips-handling-tracking-errors-javascript/cover.jpeg
pubDate: 2023-04-21T18:57:48.746Z
description: "Learn to handle and track errors more efficiently in JavaScript"
youTubeVideoId: mrJ-mK8shYQ
tags:
  - javascript
---

Let’s discuss some useful tips and tools to handle and track errors in your JavaScript applications. This is often overlooked in tutorials, where the focus is usually on the best-case scenario. By the end of this post, you'll have a better idea of how to handle and track errors, especially after deploying them to production.

## Don’t Just Use Console.log in JavaScript

Logging is more than just the `console.log()` that most people are familiar with. There are other functions available in the console object that you can use, such as `console.info()`, `console.debug()`, `console.warn()`, and `console.error()`.

Using these methods appropriately makes it much easier to filter through your logs when debugging your applications later on.

## Choose a Better Log Management Tool

Most hosting platforms have a built-in way to view yours logs. However, this isn't the most convenient way to access them as they aren’t easily searchable. For example, with an app hosted on Heroku you have a few different options. In addition to viewing logs in the dashboard, you can also use the Heroku CLI to view your logs:

```
heroku logs --tail

```

This will show your logs as they come in, making it easier to see what's happening in real-time. For a more searchable option, consider moving yours to a tool with more features and capabilities.

With my Discord bot application hosted on Heroku, I added [Logtail](https://logtail.com/) through the add-ons sidebar. It has very powerful search capabilities that makes it a lot easier to search and filter logs to help in the debugging process.

Whatever hosting platform you’re using, it’s probably worth investing in an outside tool with more functionality!

### Highlight.io

Sometimes you need more than just logging. Recently, I had the creator of [Highlight.io](https://highlight.io/) on my stream ([full video here](https://youtube.com/live/rylioudTK7U)) to show me it’s capabilities, and I was blown away!

Highlight is an open-source full-stack monitoring framework that offers session replay, error monitoring, logging, and self-hosting capabilities. Here's a quick rundown of some of its features:

1. **Session Replay**: See what users do on your website by watching a video of their session. This is great for UI/UX research and tracking errors that users encounter.
2. **Errors**: Monitor errors that occur in both the front-end and back-end of your application. Highlight.io captures detailed information about the error, making it much easier to debug.
3. **Logs**: View and search all of your logs in one convenient dashboard. This feature is relatively new but incredibly helpful.
4. **Alerts**: Configure alerts to notify you when certain thresholds are reached, such as a particular number of errors within a specified time frame.

Highlight.io offers all of these features for free, making it an excellent tool to add to your error handling and tracking arsenal.

## Conclusion

Having a solid strategy for error handling and tracking in your JavaScript applications is essential to maintaining and debugging your applications post-deployment. Using the different console methods intentionally, properly handling errors with `try-catch` blocks, and utilizing additional tools can make this process much more manageable.
