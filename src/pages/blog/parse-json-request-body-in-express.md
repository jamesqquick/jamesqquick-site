---
layout: '../../layouts/BlogPostLayout.astro'
title: Parse JSON Request Body in Express
slug: parse-json-request-body-in-express
coverImage: /images/posts/parse-json-request-body-in-express/cover.png
pubDate: 2020-08-29
description: Learn how to parse JSON body from a post request in Express.
youTubeVideoId: null
---

By default, you won't be able to parse JSON from the body of an incoming request with Express.js. The good news it, though, that it only takes one extra line of configuration.

Previously, to parse JSON bodies, you would have had to include the `body-parser` NPM package. Express had this capability built-in several versions back, but then they got rid of it. Thanksfully, Express has decided to include this capability again. You just need to activate it.

To do this, add this one line of configuration to your server. You will need to make sure you include this line before the definition of your endpoints.

    app.use(express.json());

Then, in your endpoint, you can access the body like so.

    app.post('/api/endpoint', (req,res) => {
      const body = req.body;
      res.json(body);
    })

And here's what a basic Express server looks like.

    const express = require('express');
    const app = express();

    app.use(express.json());

    app.post('/api/endpoint', (req, res) => {
      const body = req.body;
      res.json(req.body);
    });

    app.listen(3000);
