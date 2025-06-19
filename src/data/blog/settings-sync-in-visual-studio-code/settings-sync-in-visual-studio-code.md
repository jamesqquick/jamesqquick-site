---
title: Settings Sync is Built Into Visual Studio Code Now
slug: settings-sync-in-visual-studio-code
coverImage: ./cover.png
pubDate: 2020-09-15
description:
  You no longer have to download the Settings Sync extension in Visual Studio
  Code.
youTubeVideoId: 3dsq39DEgZ8
tags:
  - vscode
---

Up until recently, synchronizing your settings across multiple instances of VS Code required you to download a 3rd party extension. Well, you no longer have to download a separate extension. Settings Sync is built into VS Code, and it's awesome!

> Want to learn everything you need to know about VS Code? Check out the [Learn VS Code course](https://www.udemy.com/course/learn-visual-studio-code/)!

## Setup

VS Code has made this process as easy as possible to set up. If you open up your settings menu, you'll now see a big button that says "Turn on Settings Sync". Click that.

![](/images/posts/settings-sync-in-visual-studio-code/1.png)

After that, you'll be prompted with what exactly you want to sync. Most likely, you'll choose to sync everything, but that's up to you.

![](/images/posts/settings-sync-in-visual-studio-code/2.png)

You'll need to log in with either a Microsoft or Github. Are those one and the same now that Microsoft bought Github 🤣?

![](/images/posts/settings-sync-in-visual-studio-code/3.png)

Then...BOOM! VS Code does some magic behind the scenes!

## Check the Sync Details

You can check the status of your latest syncs by opening the command palette and running the `Settings Sync: Show Synced Data` command.

![](/images/posts/settings-sync-in-visual-studio-code/4.png)

## Real-Time Sync

If you get this set up on two different instances of VS Code you can see that changing settings on one will update the settings on another in real-time! I tested this out by running two instances of VS Code on the same computer (one is the stable version and one is the insider's edition)

![](/images/posts/settings-sync-in-visual-studio-code/5.gif)
