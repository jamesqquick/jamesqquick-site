---
layout: '../../layouts/BlogPostLayout.astro'
title: My Terminal Has SUPER Powers!
slug: my-terminal-has-super-powers
coverImage: /images/posts/my-terminal-has-super-powers/cover.png
pubDate: 2022-01-25
description: This plugin is amazing! I recently tried the Fig.io plugin for my terminal and it is AWESOME. You can get autocomplete and IntelliSense just like you do inside of VS Code right inside of your terminal.
youTubeVideoId: nVEPbUsFYxk
---

I found a new terminal plugin called [Fig.io](https://fig.io/) that gives me super powers! It has full **autocomplete** and **IntelliSense** just like inside of VS Code. This plugin is completely free (Mac only though), so you can head to the [website](https://fig.io/) now to download and install. Let's check it out.

## Fig.io In Action

The install process should be pretty straightforward, and after you have it set up, you should immediately see it in action. For example, if I start to run a `cd` command in my terminal, you can see it populates the different folder options that I can navigate to. I'm running this command from within the source code for the [Compressed.fm website](http://compressed.fm/). It's a [Next.js](https://nextjs.org/) project, so you can see the appropriate directories showing up.

![](/images/my-terminal-has-super-powers/1.png)

Adding IntelliSense for built-in terminal commands seems pretty obvious, so let's try something a little different. Let's try working with Git.

![](/images/my-terminal-has-super-powers/2.png)

After typing the word `git`, it populates with all of the potential commands that I can run. If you notice, it also shows me what the different parameters are that I can pass to each command. Pretty neat right?

Let's try something a little more obscure. I started working at [PlanetScale](https://planetscale.com/) (a managed MySQL company built for scale and Serverless) a few months ago, and I've worked with our [CLI](https://planetscale.com/cli) a lot since I started. Surely, Fig.io won't know how to work with that...right? WRONG! It works flawlessly!

![](/images/my-terminal-has-super-powers/3.png)

Lastly, what about integration with NPM commands? What if you want IntelliSense for packages that you want to install so you don't have to type the whole package name? Yep, got that too!

![](/images/my-terminal-has-super-powers/4.png)

Just by typing `npm install react`, it autopopulates the most popular React libraries!

## Wrap Up

Here's my summary. [Fig.io](https://fig.io/) is awesome. You should check it out! Let me know what you think on [Twitter](https://twitter.com/jamesqquick)!
