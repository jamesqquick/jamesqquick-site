---
title: How I Used ChatGPT In My JavaScript Projects
slug: 5-ways-chatgpt-javascript-projects
coverImage: ./images/5-ways-chatgpt-javascript-projects/cover.jpeg
pubDate: 2023-03-29T16:07:57.150Z
description: 5 ways I've used ChatGPT in my recent projects.
youTubeVideoId: 7_FHP691q5g
tags:
  - chatgpt
---

As a developer, I am obsessed with ChatGPT. It has helped me write code so much faster, and I'm excited to share five specific ways I've used ChatGPT in my JavaScript projects recently.

## 1. The Learn Build Teach Discord Bot

![ChatGPT generating discussion questions](/images/posts/5-ways-chatgpt-javascript-projects/1.jpeg)For the [Learn Build Teach Discord](http://learnbuildteach.com) community that I run, I've been working on adding a few different features to the bot. Here are some examples of how I've been using ChatGPT for this project:

1. **Generating weekly discussion questions:** I asked ChatGPT to generate interesting questions related to various topics like getting started, imposter syndrome, favorite tools, etc. The AI generated spot-on questions that I could just throw right into Discord.
2. **Converting the questions into a JavaScript array:** Instead of manually converting the generated questions into a JavaScript array, I asked ChatGPT to do it for me. I simply copied the output into my code, and then added a seed function to take all of those questions and save them into the [Supabase](https://supabase.io/) database. Now, our bot can automatically post a relevant question on a weekly basis without asking the same question again.
3. **Working with Discord.js:** The documentation for the Discord.js library used for interacting with Discord is not great, so ChatGPT helped me find the right snippet for creating a message in a specific channel and posting the discussion question there.
4. **Setting up a cron job:** To trigger the automatic posting of questions on a weekly basis, I asked ChatGPT to generate a cron-syntax string and a code snippet for using the [cron package](https://www.npmjs.com/package/cron) in Node.js. It generated not only the correct Syntax but also the right incorporation of the cron package in my code.

## 2. The JQQ Memes Project

![Jqq memes project dashboard](/images/posts/5-ways-chatgpt-javascript-projects/2.jpg)The [JQQ Memes](https://jqqmemes.com/) project is a fun endeavor where I take awkward freeze-frame images from my YouTube videos and let users create memes with them. The tech stack consists of [Next.js](https://nextjs.org), [Cloudinary](https://cloudinary.com/), and [Appwrite](https://appwrite.io/). Here are some ways I've used ChatGPT for this project:

1. **Creating a React Context:** Although creating a context from scratch in React is not very hard, I always forget the process. So I asked ChatGPT to create one for me that would keep track of the logged-in user, error state, and a loading property, as well as expose login, logout, and signup functions. The AI model did this beautifully, and I could simply drop the generated code into my project.
2. **Integrating Appwrite for authentication:** Next, I asked ChatGPT to update the login, logout, and signup functions in the created context to use the Appwrite SDK. It generated all the code needed to integrate Appwrite, and it even showed me how to reference the `useUser` hook in different parts of my application.

## 3. Writing Documentation

![ChatGPT generating readme](/images/posts/5-ways-chatgpt-javascript-projects/3.jpeg)Writing documentation can be a challenging task for developers. With ChatGPT's help, I was able to generate a README for the JQQ Memes project. The AI model looked at the code, explained the technologies used, provided information about environment variables and running the project, and even gave me a license at the bottom.

# Conclusion

These are just five ways that I've used ChatGPT recently in my coding projects. I'm curious to know how you've been using ChatGPT in your own coding journey. Let me know in the [this tweet](https://twitter.com/jamesqquick/status/1641068194017292288?s=20)!

Thanks for checking out this blog post, and I hope ChatGPT can be as helpful to you as it has been to me.
