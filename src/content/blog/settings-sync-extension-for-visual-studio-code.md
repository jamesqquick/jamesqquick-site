---
title: Settings Sync Extension for Visual Studio Code
slug: settings-sync-extension-for-visual-studio-code
coverImage: /images/posts/settings-sync-extension-for-visual-studio-code/cover.png
pubDate: 2020-01-28
description: The beautiful thing about Visual Studio Code is how easy it is to customize, but what happens if you get a new computer?
youTubeVideoId: f-uzUsHTQ8s
tags:
  - vs code
---

The beautiful thing about Visual Studio Code is how easy it is to customize, but what happens if you get a new computer? You have to take the time to install all the same extensions, manually copy over settings and keybindings, etc.

> One extension can sync all of your settings in seconds!

Well, you don't have to do that anymore! We are going to use the [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) extension to take care of that for you. This way, no matter what computer you are on, you can get your instance of VS Code synchronized with all of your settings right away!

> **The only thing you need is a Github account.**

## Installing the Extension

The first thing you'll need to do is install the extension. You can do this by searching inside the extensions tab in VS Code. You can find the icon in the side panel on the left that looks like four squares (with one a little bit off on its own).

## Configuring the Extension

After you install, you'll now need to configure the extension. Luckily, there is an information tab that opens up after installing to help you get started. On the new informational tab, choose "Login with Github".

VS Code might double-check that you want to navigate to a webpage. Choose "Open".

After logging in successfully with Github, the extension will show you what copies of settings you have already stored. At this point, you probably don't have any. In mine, you can see I already had one created. If it's your first time, choose "Skip".

By choosing skip, this will allow you to create your first Github Gist to store your settings. For demo purposes, I'm going to install my favorite theme, [Cobalt 2 theme from Wes Bos](https://marketplace.visualstudio.com/items?itemName=wesbos.theme-cobalt2). This way, after I save my settings and then download them, I can verify that the extension works. You don't necessarily have to follow this step if you have already customized VS Code in some way (settings, snippets, themes, extensions, etc.).

## Saving Your Settings to Github

Since you are already connected to your Github account, you're ready to save off your settings inside of a Github Gist.

> [Github Gists](https://help.github.com/en/enterprise/2.13/user/articles/about-gists) are a quick way to share snippets of code

To save those settings to Github, you'll need to open the Command Palette (`Command+Shift+P` on Mac and `Control+Shift+P` on Windows). Then search for `Sync: Update/Upload Settings` and press enter/return.

You'll then see a popup in the bottom right-hand corner explaining that this action will replace the existing settings. Since you don't have any existing settings, click "Yes" to continue.

After this, you can open up your gists to see the newly updated settings. To view your gists, hit the dropdown menu in your profile icon in the top right of Github and choose "Your Gists".

Here, you can see that my Gist was successfully uploaded and the settings include the Cobalt 2 theme.

## Downloading Settings

Now that you know how to save your settings in a Github Gist, I'll show you how to download them. For demo purposes, I reset my instance of VS Code to simulate starting with a fresh instance.

First, you would need to install the extension as above and login with Github credentials. After doing so, you'll again be presented with a list of existing settings Gists. After choosing the correct one (I've got three but most likely you'll on have one), you'll get notified that that Gist has been associated with your Settings Sync extension.

From here you need to open the Command Palette again (`Command+Shift+P` on Mac and `Control+Shift+P` on Windows). Then search for `Sync: Download Settings` and press enter/return.

In my personal instance, I've got around 50 extensions installed as well as custom settings, snippets, and keybindings. Mine took a few minutes to complete everything.

But BOOM. In just a few minutes, you've got all of the settings I care about in a brand new instance of VS Code!
