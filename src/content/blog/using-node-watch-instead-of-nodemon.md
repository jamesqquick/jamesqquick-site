---
title: Using Node Watch Instead of Nodemon
slug: using-node-watch-instead-of-nodemon
coverImage: /images/posts/using-node-watch-instead-of-nodemon/cover.jpg
pubDate: 2023-02-17
description: You can use the watch command in Node instead of using nodemon.
youTubeVideoId: QPSnFzj9eUw
tags:
  - nodejs
---

Nodemon has been the go-to tool for years for running a live-reloading Node.js server, but you may not need it anymore! You can now use the new `--watch` flag in Node instead.

## How To Use

To use this feature you'll need to pass the `--watch` flag to your command followed by the name of the file. If you wanted to run a file named `server.js`, for example, you would run the following:

```bash
node --watch server.js
```

This command will auto-reload your file, but only when that specifc file has changed. Let's say you want to reload your file anytime any file in a given directory changes. For this, you can use the `--watch-path` flag followed by the directory and then the file you want to run. If you're file is inside of a directory called `src`, you can use the following command:

```bash
node --watch-path=./src server.js
```

## Availability

This feature is available under a feature flag in Node 18.11+ and generally available in Node 19.
