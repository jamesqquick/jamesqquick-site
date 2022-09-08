---
layout: '../../layouts/BlogPostLayout.astro'
title: How To Redirect Netlify Functions To  a Simpler Path
slug: how-to-redirect-netlify-functions-to-a-simpler-path
coverImage: /images/posts/how-to-redirect-netlify-functions-to-a-simpler-path/cover.png
pubDate: 2020-08-06
description: Netlify Functions are one of the easiest ways to get started with Serverless. However, the default path to call a Netlify Function is a bit cumbersome. Let's learn how to simplify that path with redirects.
youTubeVideoId: null
---

Netlify Functions are one of the easiest ways to get started with Serverless, but the default path to call one is a bit tedious at `/.netlify/functions/<function_name>`. Let’s see how to simplify this so that we can call `/api/<function_name>`.

> Want to learn more about Serverless Functions in Netlify? Check out the [React and Serverless Course](https://www.jamesqquick.com/courses/react-and-serverless-fullstack-developmnent)

## Netlify Functions

Serverless Functions are gaining in popularity and Netlify is making it easier than ever to get started. To add Serverless Functions to your project, you simply need to add your functions to a specific folder and tell Netlify which folder they are in.

You can specify to Netlify what your functions directory is by creating a `netlify.toml` file with the following configuration. I typically store my functions inside of a directory called `functions` (who woulda thought? 😂).

    [build]
      functions = "functions"

From there, you can add your individual function files to that repo. If you’re building a CRUD app for movies, you might have a few different functions like so.

- getMovies.js
- addMovie.js
- updateMovie.js
- deleteMovie.js

Netlify will then recognize each file inside of your functions directory and host it as a Serverless Function IF it exports a handler functions (`exports.handler = () => {}`).

## Configuring Netlify Functions Redirect

The process above is nice, but the default path to call one of these functions is a bit cumbersome at `/.netlify/functions/<function_name>`. A path like `/api/<function_name>` is much simpler and much easier to remember. To simplify the path in this way, you can add the following redirect configuration to your `netlify.toml`

    [build]
      functions = "functions"
    [[redirects]]
      from = "/api/*"
      to = "/.netlify/functions/:splat"
      status = 200

This tells Netlify to redirect every request to `/api/<function_name>` to the full path of `/.netlify/functions/<function_name>` exactly how you want!

## Wrap Up

I would add this redirect configuration for every project you have that uses Netlify Functions. There’s no point in typing out the longer URL when you can make it SOOOO much simpler.
