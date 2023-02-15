---
layout: "../../layouts/BlogPostLayout.astro"
title: JavaScript Trends in 2023
slug: javascript-trends-2023
coverImage: /images/posts/javascript-trends-2023/cover.jpg
pubDate: 2023-02-15
description: Here are five trends in JavaScript to keep an eye out for this year!
youTubeVideoId: 8SgwWpm8M4Y
---

The JavaScript ecosystem moves overwhelmingly fast. Honestly, it's hard to keep up with. Let's take a quick look at five trends in JavaScript that you should be paying attention to in 2023.

## Writing Less JavaScript

There are several reasons why I think we'll write less overall JavaScript this year. Here are a couple.

### TypeScript

This one feels like a cop-out, but it's true. TypeScript is growing so quickly. Every day I hear from more people saying that they can't live without TypeScript. Even though TypeScript is obviously very similar to JavaScript, it's still not technically JavaScript.

### AI Services

I'll be honest, I've been skeptical of how well AI services can work for suggesting and writing code for you, but...I've been AMAZED at tools like Github [Copilot](https://github.com/features/copilot) and [ChatGPT](https://openai.com/blog/chatgpt/). It's really incredible what they can do. Although I don't think they will replace our jobs, I do think they will generate more and more code for us meaning we have less to write ourselves.

### Backend as a Service Platforms

> I prefer to build stuff quickly, and if platforms like this can take care of my backend for me. I'm all for it!

The growth of backend as a service platforms means less overall code we have to write ourselves. Platforms like [Supabase](https://supabase.com/), [Appwrite](https://appwrite.io/), and others are handling database interactions, authentication, real-time updates, and so much more so that you don't have to. Some people prefer to write all the code themselves, but not me. I prefer to build stuff quickly, and if platforms like this can take care of my backend for me. I'm all for it!

## Less JavaScript in the Tools We Use

> Maybe it's time to start learning another language...

JavaScript is being used less and less in tools for writing JavaScript. Sounds kinda weird huh? Here are a couple of examples of JavaScript tools that are written in different languages.

- [esbuild](https://esbuild.github.io/) - Go
- [Turbopack](https://turbo.build/pack) - Rust
- [Bun](https://bun.sh/) - Zig

More and more often, developers are writing JavaScript tooling in other languages because they are much more performant. Expect this to continue!

## Using More JavaScript Runtimes (Than Just Node.js)

Node.js has been the default answer to "How do you use JavaScript on the server?" for a long time, but things are changing. I think the developer community has recognized limitations with Node, and are more interested in adopting alternatives. There are several other runtimes available.

- [Deno](https://deno.land/)
- [Bun](https://bun.sh/)
- [Workers (from Cloudflare)](https://blog.cloudflare.com/workerd-open-source-workers-runtime/)

With the growth of "The Edge" (whatever that actually means), different run-time options will continue to grow in adoption.

## Ship Less JavaScript to the Browser

> The theme of leveraging the server as much as possible has been noticeable in recent updates to some of my favorite frameworks like [Next.js](https://nextjs.org/) and [SvelteKit](https://kit.svelte.dev/);

This has been a growing trend as performance for web applications becomes more important. Let's face it, the performance of your websites can directly affect your bottom line in terms of revenue. One way to speed up our applications is to simply ship less JavaScript to the browser, and frameworks across the board are buying in.

Personally, I think [Remix](https://remix.run/) was a huge spark in pushing frameworks to focus more on the server and less on the browser. From the start, Remix had hooks for loading data on the server so you didn't have to do it in the browser. This theme of leveraging the server as much as possible has been noticeable in recent updates to some of my favorite frameworks like [Next.js](https://nextjs.org/) and [SvelteKit](https://kit.svelte.dev/);

In addition, one of my favorite new frameworks [Astro]() ships ZERO JavaScript to the browser by default. It's primary goal is performance. If you haven't yet, I highly recommend checking it out.

## More Meta JavaScript Frameworks

Speaking of meta frameworks (or whatever we call them these days) like Next.js, SvelteKit, etc... Unfortunately, I think we are going to see even more popup. Honestly, there are already so many frmaeworks that it's overwhelming, but I promise I won't stop us from creating more.

Regardless of new vs existing ones, I think developers will continue to adopt meta frameworks because of how much time and effort they can save us. There's always a balance, but meta frameworks are taking care of more and more boilerplate code for us, and I think JavaScript developers are loving it!
