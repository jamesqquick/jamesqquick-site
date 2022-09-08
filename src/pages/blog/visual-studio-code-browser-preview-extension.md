---
layout: '../../layouts/BlogPostLayout.astro'
title: Visual Studio Code Browser Preview Extension
slug: visual-studio-code-browser-preview-extension
coverImage: /images/posts/visual-studio-code-browser-preview-extension/cover.png
pubDate: 2020-04-28
description: Did you know you can view a live-reloading browser preview right inside of Visual Studio Code? Well, with the Browser Preview extension, you can do just that. Setting up your Visual Studio Code browser preview is just a few clicks away.
youTubeVideoId: iyb9-eqQoMc
---

Did you know you can view a live-reloading browser preview right inside of Visual Studio Code? Well, with the Browser Preview extension, you can do just that. Setting up your Visual Studio Code browser preview is just a few clicks away. Let's see how to do it.

![](/images/visual-studio-code-browser-preview-extension/1.png)

## Why The Browser Preview Extension

As someone who records lots of videos, I'm constantly searching for the best way to display both my browser and my VS Code window at the same time. Most often, I end up switching between the two applications with shortcuts. This works fine but it can be a bit hard to follow for a user.

> Want to learn everything you need to know about VS Code? Check out the [Learn Visual Studio Code](https://www.udemy.com/course/learn-visual-studio-code/) course

Alternatively, I've also tried setting VS Code and Google Chrome to take up 50% of the screen so they can sit side by side. This is fine too, but with the Browser Preview, you can get the same type of view right inside of your editor.

## Install the Extension

Start by opening the extensions tab inside of VS Code. Then search for `Browser Preview` and click `install`.

![](/images/visual-studio-code-browser-preview-extension/2.png)

## Use the Extension

Now that you have the extension installed, let's see how to use it. This extension basically opens a (headless) browser window inside of VS Code. So, you'll need to start your application locally with a live-reloading server. If you're using react, angular, vue, etc. they come pre-packaged with a live-reloading server.

If you are using vanilla JavaScript, you can use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension to serve your site from a live-reloading server.

> [Learn more about how to setup the Live Server extension in VS Code!](https://www.youtube.com/watch?v=WzE0yqwbdgU)

With your application and server running, now you can open the browser preview. Open the command pallette (`control + shift + p` on Windows and `command + shift + p` on Mac) and search for `Browser Preview: Open Preview.`

![](/images/visual-studio-code-browser-preview-extension/3.png)

Now, you can type in the url of your app in the browser. Here's my "Quick Quiz" demo running at `localhost:5500.`

> [Check out this FREE course if you're interested in learning to build a Quiz App with HTML, CSS, and JavaScript](https://www.youtube.com/watch?v=u98ROZjBWy8&list=PLDlWc9AfQBfZIkdVaOQXi1tizJeNJipEx)

![](/images/visual-studio-code-browser-preview-extension/4.png)

## Wrap Up

So that's it. Now you have a live-reloading browser preview of your app right inside of VS Code. I'm curious, are you using the Browser Preview or Live Server extension? Let me know on twitter, [@jamesqquick](https://www.twitter.com/jamesqquick).
