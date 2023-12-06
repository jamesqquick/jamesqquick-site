---
title: BRAND NEW VS Code Extension for Testing APIs
slug: new-vs-code-extension-for-testing-apis
coverImage: ./images/new-vs-code-extension-for-testing-apis/cover.png
pubDate: 2022-08-01
description: Test your APIs directly inside of VS Code with the RapidAPI Client extension.
youTubeVideoId: VuO-Haub9-I
tags:
  - vscode
---

Did you know you can test your API endpoints right inside of [VS Code](https://code.visualstudio.com/)? I recently discovered a [BRAND NEW VS Code extension for for doing just that from RapidAPI](https://marketplace.visualstudio.com/items?itemName=RapidAPI.vscode-rapidapi-client&utm_source=jamesqquick&utm_medium=DevRel&utm_campaign=DevRel). Let's see how to use it and a few of it's best features!

## Installing the Extension

Open the extensions tab inside of VS Code and search for "RapidAPI Client". Then, click install.

![](/images/posts/new-vs-code-extension-for-testing-apis/1.png)

You may be asked to reload VS Code, so go ahead and do that.

## API Endpoint Setup with Express (optional)

In my demo, I am using a simple [Node/Express](https://expressjs.com/) server to create an endpoint that I can test against. If you already have an endpoint to test, feel free to skip this section. I won't show you how to set up the server from scratch since this isn't a Node/Express tutorial, but here is the sample code for reference.

    const express = require('express');
    const app = express();

    const data = [
        {
            link: "https://www.producthunt.com/posts/react-and-next-js-snippets",
            title: "React and Next.js Snippets - React and Nextjs Snippets with TypeScript!🚀 | Product Hunt by Avneesh",
            imageUrl: "https://ph-files.imgix.net/b17455eb-f82d-4d1a-bd22-68eac9667073.png?auto=format&auto=compress&codec=mozjpeg&cs=strip&w=440&h=220&fit=max&dpr=2",
            description:"This is a Visual Studio Code extension that gives you many React and Next.js snippets with typescript support so you don't have to rewrite the same code over and over again 😉"
        },
        {
            link:"https://egghead.io/blog/drag-to-reorder-list-items-with-framer-motion",
            title: "Drag-to-Reorder List Items with Framer Motion by willjohnsonio",
            imageUrl: "https://egghead.io/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdg3gyk0gu%2Fimage%2Fupload%2Fv1644535367%2Fegghead-next-ebombs%2F2022-will%2Fpink_orbs_hexagon_1.png&w=3840&q=100",
            description: "If you have an application with a list of items, like a to-do list, shopping list, a list of the greatest basketball players, etc. You might want to reorder your list once you have some items added to it."

        }
    ];

    app.get('/content', (req, res) => {
        res.json(data);
    });

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

In this example, I have a Node/Express server with one endpoint, `/content`, that returns some JSON data.

In this endpoint, I am returning a sample list of content that has been created from my Learn Build Teach Discord community. We have a slash command enabled in the server for people to share content they've created, so I figured it would make for a good example here.

> [Join the Learn Build Teach Discord!](https://learnbuildteach.com/)

## Testing the API Request

With the Node/Express server running, I'm now able to test out this endpoint inside of the [RapidAPI Client extension](https://marketplace.visualstudio.com/items?itemName=RapidAPI.vscode-rapidapi-client&utm_source=jamesqquick&utm_medium=DevRel&utm_campaign=DevRel) by sending a GET request to `http://localhost:3000/content`. To do so, open the extension using the icon in your sidebar.

![](/images/posts/new-vs-code-extension-for-testing-apis/2.png)

Then, click the plus icon to create a new request and populate the address.

![](/images/posts/new-vs-code-extension-for-testing-apis/3.png)

Then, click "New Request", and you should see the data returned from your API endpoint.

![](/images/posts/new-vs-code-extension-for-testing-apis/4.png)

From here, you can do all the basic things you would expect.

- change HTTP methods (GET, POST, PATCH, DELETE, etc.)
- add query parameters, headers, etc.
- add authentication parameters

In addition to the basics, there are few extra nifty features we should look at!

## Generate Code Snippets

This extension gives you a dropdown of languages that you can use to generate code snippets for making requests to the API that you are testing. There is an amazing list of languages here.

- JavaScript and TypeScript
- Java
- C#
- Python
- lots more!

To generate a JavaScript code snippet, select JavaScript as the language next to the "Request snippet" text in the bottom of the window. I'm choosing to use the Fetch API for my request. Then, you can click the `</>` button to generate the code snippet.

![](/images/posts/new-vs-code-extension-for-testing-apis/5.png)

The resulting code snippet will look like this.

    const options = {method: 'GET'};

    fetch('http://localhost:3000/content', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

From there, you can copy and paste this snippet into your project. Pretty neat!

## Generate TypeScript Types

I've becoming a bigger and bigger fan of TypeScript, so I love to have TypeScript types for any data I pull from an external API. Well, this extension can help here as well. In the lower right hand side, there is a "JSON to" section which gives you a list of type definitions you can export to including TypeScript.

To generate your TypeScript type, choose TypeScript from the dropdown and then click the code icon.

![](/images/posts/new-vs-code-extension-for-testing-apis/6.png)

For my data, I get this TypeScript definition.

    export interface RootObject {
     description: string;
     imageUrl:    string;
     link:        string;
     title:       string;
    }

## Wrap Up

I love that VS Code extensions add so much functionality without having to download external tools. If you'd like to learn more about the RapidAPI Client extension and specifically how to use environments, secret credentials, and more, [check out the full video](https://www.youtube.com/watch?v=VuO-Haub9-I).
