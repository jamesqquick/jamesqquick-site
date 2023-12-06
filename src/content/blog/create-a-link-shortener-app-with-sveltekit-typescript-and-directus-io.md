---
title: Create a Link Shortener App with SvelteKit, TypeScript, and Directus.io
slug: create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io
coverImage: ./images/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/cover.png
pubDate: 2022-08-24
description: Learn how to build a link shortener app with SvelteKit, TypeScript, and Directus.io
youTubeVideoId: 5AUUSZ5wv10
tags:
  - sveltekit
---

## Create a Link Shortener App with SvelteKit, TypeScript, and Directus.io

Let’s build a link shortener app like [bit.ly](https://stackedit.io/bit.ly) using SvelteKit, TypeScript, and [Directus.io](https://directus.io/) as our Headless CMS.

> This article is a shortened form of the full tutorial. For more details, [**watch the full YouTube video**](https://youtu.be/5AUUSZ5wv10). Note that the video uses a previous version of the SvelteKit routing API where this article uses the up-to-date API as of August 24th.

## Why [Directus.io](http://directus.io/)

There a few reasons to I really like Directus:

- open-source
- a beautiful UI with lots of customization
- nice JavaScript API
- can be deployed anywhere

Directus can sit on top of your existing SQL database which means you can add a REST API and/or GraphQL on top of your existing data in minutes! Fun stuff! Let’s get started.

> This blog post is powered by [Contenda](https://contenda.co/) which can transform videos into blog posts including images, code snippets, and more! You can get early access and one FREE content transformation using [this onboarding link](https://contenda.co/jamesqquick).

## Set-Up

In this case, instead of deploying our own instance of Directus, let’s use the built in managed version. To get started, create a free project and sign up with your Github account.

After that, create a new project. Give it a name and choose the `Community Cloud` option, which is the free version. Then, choose an empty project to start completely from scratch.

/images/
![Create new project in Directus](/images/posts/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/1.png)

After you’ve created your project and it’s been deployed, click to open it. **Note that the admin credentials for the dashboard were sent to the email address that was used to sign up**. Use those credentials to sign in.

## Creating the Data Model

For this link shortener app, we're going to need to store the short slug and the full url the user should be redirected to as well as the number of times a link has been clicked. You can also track additional [UTM parameters](https://en.wikipedia.org/wiki/UTM_parameters). These are often used for tracking impact and clicks associated with a given campaign.

From the dashboard, you create a collection to store your short links.

![Create new collection for short links](/images/posts/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/2.png)

Name the collection `short_link` and set the primary key to be `auto incremented`.

You can add built-in properties to your collection like who created it and when it was last updated. You can also add the ability to sort.

Next up, you’ll need to create the other data fields.

- **slug** - input -> String
- **url** - input -> String
- **clicks** - input -> Integer
- **utm_source** - input -> String
- **utm_medium** - input -> String
- **utm_campaign** - input -> String

![Data model overview for short link](/images/posts/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/3.png)

Next up, create a few records in the short link collection. I added a short link (`/podcast`) for my [Compressed.fm podcast](https://compressed.fm/) as an example.

![Create a new demo short link item](/images/posts/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/4.png)

## Building the API in Sveltekit

Now to the code. We’re going to use Sveltekit to create an API endpoint that is listening for an incoming request. It will take the slug out of the request, grab the associated record out of Directus, and figure out the right URL to redirect the user to.

Create a new Sveltekit project and call it `link-shortener` and complete the prompts to select yes to TypeScript, ESLint, and Prettier.

    npm create svelte@latest link-shortener

In the terminal, run `npm install` to install the necessary packages.

With the project created, you’ll need two environment variables.

- DIRECTUS_API_TOKEN (static admin token)
- DIRECTUS_URL (the URL of your deployed dashboard, ex. `https://<app_id>.directus.app`)

To get you your API token, go to the user directory, click on our admin user, and scroll down to the token section. Click to create a static token and copy it.

![Create admin tokn in Directus](/images/posts/create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io/5.png)

Next, install the `dotenv` package by running `npm install dotenv`. This package will take care of grabbing environment variables out of a `.env` file and making them accessible in the code. Then, create the `.env` file in the source of your repo and add your two environment variables.

    DIRECTUS_URL=https://<your_project>.directus.app
    DIRECTUS_API_TOKEN=<your_api_token>

Install the Directus JavaScript SDK from NPM.

```sh
npm install @directus/sdk
```

Create a new folder called `util`, and add a file named `directus.ts`. You’ll need to import Directus from the Directus package and the `dotenv` package like so.

```javascript
import { Directus } from "@directus/sdk";
import "dotenv/config";
```

Then, create an instance of Directus using the two environment variables and export it.

```javascript
import { Directus } from "@directus/sdk";
import "dotenv/config";

const directusToken = process.env.DIRECTUS_API_TOKEN;
const directusUrl = process.env.DIRECTUS_URL;

export const directus = new Directus(directusUrl, {
  auth: {
    staticToken: directusToken,
  },
});
```

Next, you’ll need to create a dynamic API route in SvelteKit. In the `src/routes/[slug]` directory, create a new file called `+server.ts`. Then, scaffold a basic route with the following code which also imports the instance of Directus. Notice the `params` and `setHeaders` properties are destructured from the incoming request.

```javascript
import { directus } from "../utils/directus";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  return new Response("", { status: 302 });
};
```

Next, you’ll need to get the slug of the URL (the dynamic part). For now, log it to the console for testing.

```javascript
console.log(params.slug);
```

Now, test it out. Start your project with the following command.

    npm run dev

By default, your server will start at `localhost:5173`. Try navigating to `localhost:5173/podcast`, to see if `podcast` is logged out correctly as the slug.

From there, you’ll want to get the correct link associated with that slug from Directus. You can query Directus for this record by passing a filter like so:

```javascript
const slug = params.slug;
const { data } = await directus.items("short_link").readByQuery({
  filter: {
    slug,
  },
});
const shortLink = data[0];
```

This query will return an array of records, so you’ll need to grab the first item in the `data` array. After querying the record correctly, you’ll need to update the existing short link and increment its `click` value.

We’ll use the `updateOne` method and specify the ID of the record we want to update. The value for the clicks will come from `shortLink.clicks + 1`.

```javascript
await directus.items("short_link").updateOne(shortLink.id, {
  clicks: shortLink.clicks + 1,
});
```

Now, you can redirect the user to the appropriate destination based on the `url` property of the short link.

```javascript
setHeaders({
  location: shortLink.url,
});

return new Response("", { status: 302 });
```

## Final Test

In my example, I created a short link (`/podcast`) for my podcast. When I navigate to `localhost:5173/podcast`, I correctly get redirected to [https://compressed.fm/](https://compressed.fm/).

Did yours redirect correctly? Did the `clicks` property get updated appropriately inside of the Directus dashboard as well?
