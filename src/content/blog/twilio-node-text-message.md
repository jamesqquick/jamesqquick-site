---
layout: "../../layouts/BlogPostLayout.astro"
title: Twilio and Node - Send Your First Text Message
slug: twilio-node-text-message
coverImage: /images/posts/twilio-node-text-message/cover.png
pubDate: 2020-02-11
description: Learn how to send text messages in Node with Twilio.
youTubeVideoId: 26X0rVLo6gc
tags: nodejs
---

I saw my first [Twilio](https://www.twilio.com/) demo about 7 years ago, and it was one of the coolest things I had ever seen. A room full of hundreds of attendees submitted their phone numbers, and all of them received text messages within seconds. In this article, I'll show you how to use [Node.js](https://nodejs.org/en/) and Twilio to send your first text message.

## Getting Started

There's a few steps we need to go through before we get to the code.

### Signup

To get started, you'll need to signup for a Twilio account. Through that process, you'll need to verify both an email and a phone number.

> Signup using my [referral link](http://localhost:8000/blog/www.twilio.com/referral/BlB5lB) and get \\$10 extra dollars to spend!

### Additional Info

As part of the signup process, you might be prompted for a few extra details.

- "Do you write code?"
- "What is your preferred language?"
- "What is your goal today?"

Since this is a demo using Node, I chose yes to being a developer, Node as the language, and goal of using Twilio in a project.

### First App and dashboard

After sign up is successful, you'll be taken to your dashboard where a demo app has been created for you. Mine is called "My First Twilio Project". From here, you'll have access to several things.

- your Account SID (unique application identifier) and Auth Token (you'll need these shortly)
- button to "Get a Trial Number"
- links to QuickStarts

### Set Up A Trial Number

You'll need to set up a trial number to be able to send text messages. Click the `Get a Trial Number` button to generate your first number. Then click `Choose this Number`.

You'll need this number shortly.

## The Code

Now that you have your account and phone number set up, you have the 3 pieces of information you need to start writing code.

- Account SID
- Auth Token
- Phone number

### Initialize Project

We are going to create a Node project to send our text message. Make sure that you have [Node](https://nodejs.org/en/download/) installed on your machine.

With Node installed, open a folder in your favorite text editor ([VS Code](https://code.visualstudio.com/) for the win!) and create one file, `app.js`.

> [Learn everything you need to know about Visual Studio Code, the most popular editor for Web Development](https://www.udemy.com/course/learn-visual-studio-code/)

Now you can initialize your folder as a JavaScript project by running `npm init` in the command line. For now, I would just accept all of the default values.

### Installing NPM Packages

There are two packages we will need for this demo, [twilio](https://www.npmjs.com/package/twilio) and [dotenv](https://www.npmjs.com/package/dotenv). Go ahead and install these by running the following command.

    npm install twilio dotenv

### DotEnv

Environment variables are used so that developers don't check sensitive information into source control. Things like applications secrets, API keys, and auth tokens are NOT something that should be seen by anyone else. **Never check them into your source code.** Instead, put them in environment variables and reference them as you'll see in a second.

> [Learn more about environment variables using dotenv](https://www.youtube.com/watch?v=i14ekt_DAt0&t=1s)

Typically, environment variables are stored in your website host, but for development, we can reference them locally. To do so, create a new file `.env`. Inside this file, we will add our environment variables as key-value pairs. One for the application SID and one for the auth token. It will look like this.

    TWILIO_ACCOUNT_SID=<YOUR_ACCOUNT_SID> TWILIO_AUTH_TOKEN=<YOUR_AUTH_TOKEN>

Now, in the `app.js` file add the following line. This line allows us to access environment variables from our `.env` file.

    require("dotenv").config();

### Create Twilio Client

Now, we need to create an instance of the Twilio client. We will first get a reference to both of the environment variables mentioned above and use them to create the client. To access environment variables use `process.env.[VARIABLE_NAME]`

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

### Send Text Message

With the Twilio client set up successfully, we are ready to send a message. To do so, we will call `client.messages.create()` and pass in an object representing the message. The message object will have three properties.

1.  body - the body of the message
2.  from - the number the message is sent from (this is the one you created earlier in the Twilio dashboard)
3.  to - the number you want to send the message to (use the number that you verified during the signup process)

It will look like this.

    client.messages.create({
      body: "This is a test text message!!",
      from: "<FROM_NUMBER>",
      to: "<TO_NUMBER>",
    });

Calling the `create()` function returns a promise. This means we need to add a `.then()` and `.catch()` to determine whether the message was sent successfully or whether there was an error. In both cases, we can log the result out to the console. It looks like this.

    client.messages
      .create({
        body: "This is a test text message!!",
        from: "<FROM_NUMBER>",
        to: "<TO_NUMBER>",
      })
      .then(message => console.log(message))
      .catch(err => console.log(err));

That's it. That's all it takes. Here's the final code.

    require("dotenv").config();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    client.messages
      .create({
        body: "This is a test text message!!",
        from: "<FROM_NUMBER>",
        to: "<TO_NUMBER>",
      })
      .then(message => console.log(message))
      .catch(err => console.log(err));

To test it out, run `node app.js`, and you should see the text message on your phone!

## Wrap Up

Twilio is a sweet service that is used across the world. I think it's super fun to play with in demos but also very applicable for real-world applications. Hopefully, this gets you started and you come up with creative ways to use Twilio in your projects going forward.
