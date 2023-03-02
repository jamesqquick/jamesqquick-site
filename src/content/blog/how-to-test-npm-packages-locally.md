---
title: How To Test NPM Packages Locally
slug: how-to-test-npm-packages-locally
coverImage: /images/posts/how-to-test-npm-packages-locally/cover.png
pubDate: 2020-06-23
description: Learn how to test your NPM packages locally before publishing.
youTubeVideoId: Knw8U5XyHaM
tags:
  - javascript
---

When creating NPM packages, it's much better to test them locally before publishing. Let's take a look at how to do that.

> Shoutout to [Brad Garropy](https://bradgarropy.com/) for sharing his knowledge on NPM packages with me.

## TLDR

- link your package locally
- create a test application
- link the NPM package in your test application
- do the test stuff

## Getting Started

You'll need an NPM package local on your machine. If you've never created an NPM package before, you can learn how to create one by following this article, [Creating and Publishing NPM Packages](https://jamesqquick.com/blog/how-to-create-and-publish-npm-packages).

> For clarity, let's assume the name of the package we are working on is name `jqq-package`. You'll need to replace this with the name of your actual package.

You'll also need an application to test your package with. For this, create a new folder and open it inside of your text editor. I recommend VS Code 😀.

Then, initialize this test project by running `npm init`.

## Let's Test It

With your NPM package local to your machine, you'll need a way to reference/install it in the test application.

**Inside of the original NPM package directory**, run `npm link` from the command line. This command will allow us to simulate installing this NPM package without it actually being published.

From there, we need to link to this package from inside of the **test directory**. You can do this by running `npm link` followed by the name of the local package. In this demo, the name of the package we want to test is `jqq-package` so you would run `npm link jqq-package`, but make sure to use the specific name of the package you are testing.

Now, you should be able to test the package in whatever way makes sense. I won't go into detail here because this varies significantly based on what your package does, but hopefully, this sets you up to run whatever tests you think make sense.

## Wrap Up

I've been really pleased with how easy it is to create, test, and publish NPM packages. Hopefully, this helps you in testing your packages. If you have any awesome NPM packages to share or additional questions, please reach out on [Twitter](https://www.twitter.com/jamesqquick).
