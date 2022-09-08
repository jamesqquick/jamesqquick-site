---
layout: "../../layouts/BlogPostLayout.astro"
title: I Tried Astro - 5 Reasons Why I Love It!
slug: i-tried-astro
coverImage: /images/posts/i-tried-astro/cover.png
pubDate: 2022-09-08
description: I recently tried Astro framework for the first time, and it's amazing!
youTubeVideoId: wND4lSml31A
---

I tried Astro after hearing all the hype, and I freaking love it!

![Astro framework home page](/images/posts/i-tried-astro/1.jpg)

> This is an abridged version of the original video. [Watch the full tutorial on YouTube](https://youtu.be/wND4lSml31A).

Here are five reasons you'll love it too:

## 1. Ships ZERO JavaScript By Default

Astro is great for those who want to create pages without any default javascript. This means that each page is truly static and only html is sent to the browser. This can improve performance by reducing the amount of javascript that needs to be loaded.

## 2. Built-in Markdown Support (and mdx)

Do you like writing in Markdown but find the struggle of setting up syntax highlighting a bit too much? Well, good news! With Astro, you get Markdown support and code highlighting out of the box. So you can focus on what you're writing instead of worrying about the technical details.

## 3. Astro Integrations (Tailwind, MDX, SEO, etc.)

I'm really excited about the possibilities that Astro offers for making website development easier. One of the things I love is the fact that you can add integrations with just a few clicks. No more fiddling around with config files or spending time on boilerplate code!

![Astro integrations home page](/images/posts/i-tried-astro/3.jpg)

## 4. Bring Your Own Framework (React, Svelte, Vue, etc.)

Next up is the no javascript feature! This allows you to use other frameworks inside of Astro. So, if you have components that are already written in frameworks like View or Svelte or React, you can just bring them right into Astro and they'll work.

This is really cool because you can use the components you're already familiar with, without having to load javascript by default. You can just add a tag for client load to tell when and if to load the javascript associated with it. So if you want a button where you want the functionality you want to maintain pieces of state, you can just add a tag for client load and the javascript will only load when you need it.

![Astro using React component](/images/posts/i-tried-astro/4.jpg)
This is really cool because it saves you from loading unnecessary javascript, which can make your app run faster.

## 5. Islands Architecture

Astro is the future of how we think about loading javascript on the page. With its island architecture, Astro allows us to define components inside of a page where only certain components need javascript. This way, javascript is only loaded asynchronously for those specific components, making your website load super fast. Additionally, Astro supports lazy loading for islands, meaning that components will only hydrate when they scroll into view. This flexibility and performance is why I'm migrating my blog to Astro.
