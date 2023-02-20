---
title: Authentication Experience From a Developer - Frank Calise
slug: authentication-experience-from-a-developer-frank-calise
coverImage: /images/posts/authentication-experience-from-a-developer-frank-calise/cover.png
pubDate: 2020-01-24
description: Here about Frank Calise's experience with implementing authentication with Auth0 into a mobile app.
---

Here about Frank Calise's experience with implementing authentication with Auth0 into a mobile app.

After starting at [Auth0](https://auth0.com/), I figured it would be good to know more about experiences (positive or negative) that developers have had with authentication, identity, and potentially Auth0 specifically. That said, I met [Frank Calise](https://twitter.com/frankcalise) on twitter, and he agreed to chat with me for a few minutes. Here's what came of it.

> BTW. Open invitation to anyone that would like to share their experience with me. Reach out on Twitter, [@jamesqquick](https://twitter.com/jamesqquick).

## How It Started

I wrote a [blog post](https://www.jamesqquick.com/blog/my-first-week-at-auth0) explaining how excited I was after my first week at Auth0. Turns out, Frank read the article and was glad to hear about my positive experience because of having used Auth0 himself.

After hearing that he had used Auth0 before, I asked if he would be open to chatting with me about the experience, and well... he said yes lol

> I don't think I'm able to do my job as an Advocate if I'm not genuine with developers in the community.

I did make sure to let him know that I wasn't a salesperson. Obviously, there's nothing wrong with salespeople, but I wanted to make sure he understood my intent for the conversation. **I wanted this to be a genuine conversation between developers**. I don't think I'm able to do my job as an Advocate if I'm not genuine with developers in the community. Thankfully, he said he already followed me before joining Auth0, so I had already earned some trust.

### His Development Background

Frank was brand new to JavaScript a few years ago and needed to build a web app. At the time Angular was going through the tough rebranding from Angular.js to Angular 2+, so he decided to go with React. The app required secure authentication functionality in a short timeline and led to this reaction.

> “I can’t just turn around and build some super secure thing in three weeks”

Ya, I laughed too. 😂

### Using Auth0

Obviously, with such a quick (basically impossible) turnaround, he started to look for tools to help. After struggling to understand OAuth through posts on Stack Overflow, he found Auth0.

> Auth0 handles all of the deep security knowledge for you. As a developer, you just have to focus on building your applications.

After deciding to give Auth0 a try, he was able to **build a POC in a couple of days**. He said the **docs were really good** and made it easy to get started.

All in all, here's what he had to say.

> "Oh yeah I blew past auth and skipped over essentially having to do any deep development auth related for the front end, which allowed me to implement other features to show off to investors more quickly."

On the technical side, here's one piece of feedback he had. The Auth0 library he was using (again a couple of years ago) only allowed him to work with callbacks and not promises. Promises are typically preferred by JavaScript developers and allow them to take advantage of nifty features like [Async/Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

That was a couple of years ago. Turns out, the [newest version of the Auth0 SDK for Single Page Applications](https://auth0.com/docs/libraries/auth0-spa-js) **does supports promises**, so no harm there.

In regards to Auth0 library changes, etc. he also said.

> "And all the communication from Auth0 has been great when deprecating a piece of the library, some [function](http://localhost:8000/blog/authentication-experience-from-a-developer-frank-calise) call, etc."

One interesting note I found was that he had used [jwt.io](http://jwt.io/) (like millions of others have) to inspect JSON Web Tokens, but he didn't realize that site is built by Auth0 and owned by my team for that matter. I thought that was cool for **Auth0 to have the defacto tool for inspecting JSON Web Tokens** even if people didn't realize it.

## What I Learned

It's always great to make a connection in the community. This is something I'm going to do more. I've got an open invitation to anyone that would like to share their experience with authentication, identity, Auth0, competitors, etc. If you're interested in sharing, please reach out on [twitter](https://twitter.com/jamesqquick).
