---
layout: "../../layouts/BlogPostLayout.astro"
title: How To Create and Publish NPM Packages
slug: how-to-create-and-publish-npm-packages
coverImage: /images/posts/how-to-create-and-publish-npm-packages/cover.png
pubDate: 2020-06-23
description: Ever wondered how to create and publish NPM packages that millions of JavaScript developers across the world can use? Creating and publishing NPM Packages is much simpler than you might think. It's as simple as creating an account, creating a repository, and connecting them together. You'll have your first NPM package published in just a few minutes!
youTubeVideoId: Knw8U5XyHaM
---

Ever wondered how to create and publish NPM packages that millions of JavaScript developers across the world can use? Well, creating and publishing NPM Packages is much simpler than you might think. Let's see how!

> Shoutout to [Brad Garropy](https://bradgarropy.com/) for sharing his knowledge on NPM packages with me.

## TLDR

- create an NPM account
- initialize a new JavaScript project with `npm init`
- configure the package.json
- write some code
- publish

## Setup

First, you'll need to sign up for a FREE account on [NPM](https://www.npmjs.com/).

![](/images/posts/how-to-create-and-publish-npm-packages/1.png)

Then, create a directory on your file system (name it whatever you want) and open it inside of your favorite text editor. I recommend [VS Code](https://code.visualstudio.com/)!

Now, you'll need to initialize your project by running `npm init`. Feel free to choose all of the default values. There's a couple of properties that will be important.

- **name** - name of the project as it is listed in NPM (must be unique)
- **version** - the version of your package (must be updated every publish)
- **main** - which file will be referenced when someone tries to use your package in a Node environment

## Writing the Code

Now, create an `index.js` file. Then, add a log statement.

    console.log("Hello NPM Package World!!")

If this code is going to be used in a Node environment, when someone requires this package, that code will run immediately. Alternatively, you could export a function that the user could choose to call. We'll see both of these in a sec. For now, add another snippet to the file to export a function in the `index.js` file.

    console.log("Hello NPM Package World");

    const sayHi = () => {
      console.log("HIIIIIIIIIIIII!!!");
    }

    module.exports = {
      sayHi
    }

> Before publishing, it's a good idea to test your package locally. Find out how, [How to Test NPM Packages Locally.](https://www.jamesqquick.com/blog/how-to-test-npm-packages-locally)

[](https://www.jamesqquick.com/blog/how-to-test-npm-packages-locally)

## Publish the Package

With your code ready to go, the last thing to do is set the version in the `package.json` file. You can set this manually, or NPM gives you a few commands you can use.

- **npm version major**
- increase major version
- **npm version minor**
- increase minor version
- **npm version patch**
- increase patch version

Now, login to your NPM account from the command line using `npm login`. You'll need to enter your username and password. Note that as you type your password, nothing will be shown. It's still working, it's just invisible for security purposes. This tripped me up for a while 🤷‍♂️.

Now, to publish, run `npm publish` in your terminal.

To confirm that it worked, visit your packages page (click your profile image to find this link) on NPM and check that your new package has been uploaded!

![](/images/posts/how-to-create-and-publish-npm-packages/2.png)

## Test it Out

To test that the package works, you'll need to create another project, initialize it with `npm init` and create an `index.js` file. Now, you can install the published package by running `npm install <YOUR_PACKAGE_NAME>` just like any other package.

Then, you can import it in your `index.js` file.

    const mypPackage  = require('<YOUR_PACKAGE_NAME>');

Then run your `index.js` file using `node index.js`.

You should see the original log message in your terminal. You can take this one step further by destructuring and calling the `sayHi()` function that we also created.

    const { sayHi } = require('<YOUR_PACKAGE_NAME');
    sayHi(); //HIIIIII

## Wrap Up

I was really impressed with how easy it was to create and publish NPM packages myself. So, my question to you. Have you created an NPM package before? Do you have a cool one to share? Let me know on twitter, [@jamesqquick](https://www.twitter.com/jamesqquick).
