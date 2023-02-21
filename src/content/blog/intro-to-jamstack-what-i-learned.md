---
title: Introduction to the JAMstack Course - What I Learned
slug: intro-to-jamstack-what-i-learned
coverImage: /images/posts/intro-to-jamstack-what-i-learned/cover.png
pubDate: 2020-04-20
description: I just recently finished the Intro to the JAMstack course by Jason Lengstorf on Frontend Masters and loved it! I consider myself to be relatively well versed in the JAMstack, but I still learned a ton. Here are a few of the tidbits.
tags: javascript
---

I just recently finished the ["Intro to the JAMstack"](https://frontendmasters.com/workshops/jamstack/) course by Jason Lengstorf on Frontend Masters and loved it! I consider myself to be relatively well versed in the JAMstack, but I still learned a ton. Here are a few of the tidbits.

## Gatsby.js

I have never created a Gatsby app that didn't start with a template. It's kind of like how we all use `create-react-app` for react apps. I mean, do you ever create a React application truly from scratch? I don't, at least, so it was really interesting when Jason did.

I was blown away by the fact that the only thing a Gatsby app needs (in addition to the Gatsby package itself) is a `gatsby_config.json` file. I had no idea 🙀 It makes sense, I just hadn't thought of that before.

### Managing Client-Side Routing

One of the huge benefits of using Gatsby and similar frameworks is the fact that you get automatic routing. But, what if you want more control over those routes? Well, in Gatsby, you can design it so that you handle certain routes yourself. For example, if you want to have an authenticated dashboard while the rest of the app doesn't require authentication, you can target those specific routes, `/dashboard/*`, and do whatever logic you need to instead of letting Gatsby do it by default.

Again, this was super interesting because it's not something you see very often. Gatsby's built-in routing is amazing, so why customize it yourself? Well, there are times when it makes sense and Jason walks through it pretty well!

## HTML Form

Forms are the bane of my existence. I feel like they are the hardest thing to design, but Jason had a great tip for `label` elements. He makes them a bit smaller in terms of font size but then makes them uppercase. This de-emphasizes and emphasizes it at the same time (is that even possible? 🤷‍♂️Well, it worked and looked nice.

### Honey Pot

The second thing I learned about forms (which I had heard before) was to use a "Honey Pot" to help protect your forms from bots. What you do is create an invisible input on your form as a trap. Users won't fill it in but bots will. You can start to filter those form submissions based on whether or not that secret input is filled in. If it is filled in, then ignore it!

## Netlify

Netlify is by far my one of my favorite platforms/tools, and I use it to host my personal sites including serverless functions. Here's a little nugget I picked up about serverless functions.

### Define Redirects for Serverless Functions

One of the issues with serverless functions in Netlify is how you access them. They are available at `/.netlify/functions/<function_name>`. This isn't a huge deal, but it is unnatural to type out that whole thing. So, instead, you can define a redirect in your `netlify.toml` to redirect something more common like `/api/*` to `/.netlify/functions/*`. This becomes much more intuitive to work within the frontend.

    [[redirects]]
      from = “/api/*”
      to = ‘/.netlify/functions/servers/:splat’ status = 200

### Netlify Identity

Another cool feature in Netlify that I haven't played around with yet is Netlify Identity. You can use it to add authentication (and probably authorization??) to your app. This is particularly interesting for me as I work at Auth0, an identity company. I'm going to be diving in more so that I can do a more appropriate comparison with our own product and SDKs later on.

## FaunaDB + GraphQL

I've heard about FaunaDB for a while, but never gotten hands-on with it. It's becoming super popular in the JAMstack space, so I'm glad I got to get a glimpse during this course. The thing I learned is that FaunaDB is GraphQL ready. This means that you can upload your own GraphQL schema to Fauna and it will take care of the rest. From then on, you can send GraphQL queries to Fauna and be off and running.

## useReducer in React

I first got introduced to reducers in a course that used Redux, and I thought it was overwhelmingly complicated (I still might a bit but not like I used to). It just always seemed like overkill and it didn't click. Well, in this course Jason usees the useReducer Hook in JavaScript to simplify state management in a form.

I can say that useReducer did simplify a lot of the logic in React and made it more readable and structured after understanding what was going on. I just migrated one of the forms on my personal site to usee this hook.

## JavaScript Currying

And lastly, currying, which I had never heard of. It's basically where you define a function that returns another function. This can be useful in React. Here's an example.

Say, you have a form with several inputs and you have to update state appropriately when any of those inputs change. Well, you might do something like this where you define a function inline in your input that calls another function so that you can pass the `event` as the parameter.

    const handleInputChange = (e, name) => {
      this.setState({name:e.target.value});

    }

    ...

    <input onChange={(e) => handleInputChange(e, "name")}>

Well, with currying you simplify that a bit by defining a function that returns a function.

    const handleInputChange = (name) => (e) => {
      this.setState({name:e.target.value});

    }

    ...

    <input onChange={handleInputChange("name")}>

This works because the event is passed automatically to the function inside of the `onChange`. So, the `handleInputChange` function accepts the `name` parameter and then returns a function that accepts an event, and still has a reference to the `name` parameter. Pretty nifty stuff huh?

## Wrap Up

All in all, this course was great. I can't wait to check out more courses on Frontend Masters!

Question for the readers. Have you taken any courses on Frontend Masters? What are your favorites? Let me know on [twitter](https://twitter.com/jamesqquick)!
