---
title: Supercharge Your Git Workflow with the GitLens VS Code Extension
slug: supercharge-your-git-workflow-with-the-gitlens-vs-code-extension
coverImage: /images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/cover.png
pubDate: 2020-09-01
description: Want to supercharge your Git workflow inside of Visual Studio Code? Well, you
  need to check out the GitLens extension. It's jam-packed with amazing features
  for improving your Git workflow right inside of VS Code.
youTubeVideoId: C6wMNoe78oc
tags:
  - vscode
---

The other day, I saw a list of GUI tools for working with Git, and I thought, what about VS Code?

VS Code already has amazing built-in support for Git, but it also has a vast ecosystem of extensions. In this article, let's take a look at the one extension that will **supercharge your Git workflow in VS Code**, [the GitLens Extension](https://gitlens.amod.io).

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/1.png)

## How to Install

To install the extension, open the extension panel inside of VS Code and search for GitLens and then click install.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/2.png)

Once you install, you'll have a new menu item in the sidebar with lots of options. We'll get to those more in a minute.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/3.png)

## Blame Information

This extension provides simple Git blame information, who wrote the code, when they committed, etc. By default, you can see this in two different places, alongside the code, and on the bottom bar.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/4.jpeg)

It's pretty useful to see this info at a glance. In addition, if you hover over the blame info you get a context menu with some extra info including a button to view the commit.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/5.png)

## File and Line History

You also have the ability to view and compare Git history by file and even by line in the sidebar menu. This menu is contextual, so it will pull up information about the file and line you currently are on in the editor itself.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/6.png)

From there, you can also pull up a diff comparing that line or file vs the previous commit. This is incredibly handy to quickly see what has changed.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/7.png)

## Search Commits

Another great feature is the ability to search through commits. You've got several different options to search by.

- message
- author
- commit
- file
- changes

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/8.png)

This is by far the easiest way I've found to search through commits.

## Customization

There are also lots of customization options for this extension. There are too many to list them all out, but here are a few that I found useful.

- **Blame: format** - customize how your blame messages look
- **Headmap:Enabled** - toggle on a visual heatmap to show how recently code has changed (you can also customize the heat colors!)
- **Hovers > Annotations:Enabled**
- toggle whether you want the additional details when hovering on a blame message

Again, there are so many options. I suggest scrolling through and taking a look. You can find them in your VS Code settings Window.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/9.png)

## Other Commands

There's so much this extension can do, that you'll honestly just have to take a look for yourself. I would suggest opening the command palette (`CMD+Shift+P` on Mac and `CNTRL+SHIFT+P` on Windows), searching `GitLens,` and scrolling through the available commands.

![](/images/posts/supercharge-your-git-workflow-with-the-gitlens-vs-code-extension/10.png)

This extension does a ton, so it's worth just poking around to see what's useful.
