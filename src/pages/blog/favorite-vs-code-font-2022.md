---
layout: '../../layouts/BlogPostLayout.astro'
title: My Favorite FREE VS Code Font in 2022  - Install and Setup with FONT LIGATURES!
slug: favorite-vs-code-font-2022
coverImage: /images/posts/favorite-vs-code-font-2022/cover.png
pubDate: 2022-08-02
description:
youTubeVideoId: n9sklnvelhg
---

VS Code is amazing, but it's pretty boring looking by default. The good news is that it only takes a few minutes to start to customize it and make it look much more fun! In this article, I'm going to show you how to install and setup my favorite FREE VS Code font, [Cascadia Code](https://github.com/microsoft/cascadia-code).

## Install

To install the font, download the latest ZIP file from the [releases pages](https://github.com/microsoft/cascadia-code/releases)(2111.01 as of this article). After you've installed the ZIP, extract the files.

Then look for the different font files inside of the `ttf` folder.

![](/images/favorite-vs-code-font-2022/1.png)

On a Mac, you can double click each one of these files, and choose install.

![](/images/favorite-vs-code-font-2022/2.png)

On Windows, I believe you can right-click on the font files and choose "Install". Here's a link for more details, [How to Download and Install Cascadia Code Font for Windows](https://windowsloop.com/download-install-cascadia-code-font/) .

## Setup in VS Code

Now that you have the font installed, you need to configure VS Code to use it. This will only take a second. Open your VS Code settings by clicking the gear icon in the lower left corner. Then, search for "Font Family" and type in "Cascadia Code".

![](/images/favorite-vs-code-font-2022/3.png)

Now, if you look at your code, it should look much better! Note that you may see a bit of a delay here. You may have to close a code file and open it back up.

## Font Ligatures

One of my favorite features of this font is the ability to use Font Ligatures which create custom characters for things like triple equals, arrows, etc. In your settings, search for "Font Ligatures", and click "Edit in settings.json". Then, assign that property in JSON to `true`.

    {
      //...other settings
      "editor.fontLigatures":true
    }

Here's a final screenshot of my code!

![](/images/favorite-vs-code-font-2022/4.png)

Note that I think these a really neat, but keep in mind that you'll be sacrificing a bit of readability by using them since many people aren't used to seeing them.

## Extra Fonts

I figured I'd give you two additional font options if you're interested.

[Fira Code](https://github.com/tonsky/FiraCode) is another great FREE font that also supports font ligatures.

[Dank Mono](https://philpl.gumroad.com/l/dank-mono#:~:text=Phil%20Pluckthun,italic%20variant%20and%20bold%20style.) is a PAID font (about $40 USD I think), and is one of the coolest fonts I've ever seen.

## Wrap Up

Hope your VS Code is looking a lot more fun now. I'm curious what your favorite VS Code font is? Let me know [in this tweet](https://twitter.com/jamesqquick/status/1554472896285794307)

If you'd like more tips for working with VS Code, check out my [FREE VS Code Cheat Sheet](https://learn.jamesqquick.com/vs-code-cheat-sheet).
