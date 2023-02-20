---
layout: "../../layouts/BlogPostLayout.astro"
title: JavaScript Callbacks Explained in 5 Minutes
slug: javascript-callbacks-explained-in-5-minutes
coverImage: /images/posts/javascript-callbacks-explained-in-5-minutes/cover.png
pubDate: 2022-08-09
description: Callbacks are an essential part of understanding JavaScript especially when dealing with asynchronous code. Let's cover the basics of callbacks in about 5 minutes with a handful of examples!
youTubeVideoId: kz_vwAF4NHI
tags: javascript
---

Callbacks are an essential part of understanding JavaScript especially when dealing with asynchronous code. Let's cover the basics of callbacks in about 5 minutes with a handful of examples!

## What Are Callback Functions?

One of the more unique aspects of JavaScript is how it handles/treats functions. Functions are considered to be "first-class citizens". This has a couple of different implications.

- functions are objects
- you can assign a function to a variable
- **functions can be passed as a parameter to a function**

The last bullet point is is in bold because it is essential to the idea of callbacks.

> Callback functions are functions that are passed as a parameter to another function.

## Basic Callback with setTimeout

One of the first times that JavaScript developers encounter a callback function is when using the `setTimeout()` function. Here's a simple example.

```javascript
setTimeout(() => {
  console.log("Hello");
}, 100);
```

In this case, we are telling JavaScript to call our callback function after waiting for 100 ms. The `setTimeout()` function takes two parameters: a callback function and a timeout number in milliseconds. We can make this more obvious by creating a separate function completely instead of using an inline anonymous function.

```javascript
//this is the callback function
const timeoutCallback = () => {
  console.log("Hello");
};

setTimeout(timeoutCallback, 100);
```

It works the exact same as the previous snippet, but now we've separated the function out more clearly.

## Callbacks in Array Functions

If you've written much JavaScript in the past couple of years, you're probably familiar with array functions like `map()`, `reduce()`, `filter()`, `forEach()`, etc. Each of these functions leverages callbacks. They each will iterate through an array and call the callback function for each item. Here's an example with `forEach()`.

```javascript
const names = ["james", "jess", "lily", "sevy"];
names.forEach((name) => {
  console.log(name);
});
```

In this case, the callback function is defined inline and accepts a parameter which is an individual name from the `names` array. It then logs that name to the console. This example may seem simple, but let's take a look at what's going on behind the scenes.

## Building forEach() From Scratch With Callbacks

Building JavaScript functions from scratch has always been an amazing learning exercise for me, so let's give it a try here. Let's create our own version of the `forEach()` function to get a clearer idea of how callbacks work.

Let's create a new function `myForEach()` that accepts two parameters, an array and a callback function.

```javascript
const myForEach = (arr, cb) => {};
```

Inside of the function, we can create a for loop to iterate through the array and get access to each element.

```javascript
const myForEach = (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
  }
};
```

From there, we'll call the callback function and pass the individual element as a parameter.

```javascript
const myForEach = (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    cb(element);
  }
};
```

That's it. That's basically what all of the array functions are doing behind the scenes. Building these kinds of example have always helped my understanding, so hopefully it's helped you as well!

## Asynchronous Callback Functions

The array function examples shown above are dealing with synchronous code, so let's look at an example of how it works with asynchronous code. Let's use the built in `fetch()` function in JavaScript to request data from the FREE [PokeAPI](https://pokeapi.co/).

In this case, we make a fetch request to the PokeAPI for a Pokemon with an id of 56 (do you know which one that is? 👀).

```javascript
fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    console.log(data);
  });
```

Fetch returns a promise, so we have to use `.then()` to wait for the response to come back. We then convert the data to JSON which returns another promise. Finally, we log out the Pokemon data. We are passing a callback function to each instance `.then()`. This is beneficial because we continue to run other code while the request is running instead of waiting the entire time for the data to be returned.

## Wrap Up

Callbacks are an essential part of JavaScript. The flow and usage can seem tricky at first, but hopefully it's gotten simpler with a few examples!
