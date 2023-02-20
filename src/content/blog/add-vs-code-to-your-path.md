---
title: Add VS Code To Your Path
slug: add-vs-code-to-your-path
coverImage: /images/posts/add-vs-code-to-your-path/cover.png
pubDate: 2020-01-28
description: Learn how to add VS Code to your path so you can open it from the terminal.
---

When you install VS Code, you'll want to make sure you also add it to your path. The problem is the VS Code needs to be added to your path so that the terminal knows how to run the `code` command. Thankfully, the VS Code team has already thought of this for you and added an easy way to fix it.

Open the command palette (`CMD+Shift+P` on Mac and `CTRL+Shift+P` on Windows) and type `Shell Command`. You'll see two options, one to `Install 'code' command in PATH` and one to `Uninstall 'code' command from PATH`.

If you haven't guessed already, choose `Install 'code' command in PATH`. You should then be able to use the `code` command from the command line. If, later on, you for some reason need to remove it from the path, follow the same steps but choose `Uninstall 'code' command from PATH`.
