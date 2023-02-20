---
title: Querying Multiple Datasets with Gatsby Source Filesystem
slug: multiple-datasets-with-gatsby-source-filesystem
coverImage: /images/posts/multiple-datasets-with-gatsby-source-filesystem/cover.png
pubDate: 2020-01-24
description: Learn how to query multiple different data sets in Gatsby with the Gatsby Source Filesystem plugin.
---

Gatsby is one of the more popular frameworks for building blogs these days. By using the [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/) plugin you can read in markdown files and generate corresponding blog post pages.

> How do you query different datasets in Gatsby?

One question I've had though is how to work with multiple datasets. For example, I have a page for my blog and a page to display the recent conference talks I've given. The content for these pages is stored in Markdown files. My issue was that I didn't know how to query specifically for blog content and talks content? Here's what I came up with.

## Project Setup

In my project, I've got a `data` folder. Inside of the `data` folder is a `talks` folder and a `posts` folder. In each of those folders are the actual markdown files. For example.

- data
  - posts
    - post1.md
    - post2.md
- talks
  - talk1.md
  - talk2.md

In my `gatsby-config.js` I have this configuration for the `gatsby-source-filesystem` plugin.

    {
      "resolve": `gatsby-source-filesystem`,
      "options": { "name": "data", "path": `./src/data/` }
    }

## The Query

I found two options to solve the problem.

> Use `sourceInstanceName` to query data sets by name

First, you can specify your data set by using a filter on `sourceInstanceName`. The value that you filter on should be equal to the name property in the configuration above 👆️, in this case `data`.

    { allFile(filter: { sourceInstanceName: { eq: "data" } }) { edges { node { absolutePath } } } }

The downside to this is that you would need to create multiple configuration objects in your `gatsby-node.js` file for it to work.

    (
      {
        "resolve": `gatsby-source-filesystem`,
        "options": { "name": "posts", "path": `./src/data/posts/` }
      },
      {
        "resolve": `gatsby-source-filesystem`,
        "options": { "name": "talks", "path": `./src/data/talks/`
      }
    })

Works fine, but it is hard to scale. You probably don't want many different config objects. Alternatively, you can use a regex expression to filter based on the folder path. In other words, you can query for all files in the `talks` folder and/or the `posts` folder separately.

So, keep the plugin configuration the same as we had it originally, and then update your query like so.

    { allFile(filter: { absolutePath: { regex: "//posts//" } })
      { edges
        { node
          { absolutePath }
        }
      }
    }

## Recap

There you go. Now, you shouldn't have any issue querying different data sets within Gatsby!
