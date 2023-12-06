---
title: Make Deep Clones in JavaScript With structuredClone
slug: deep-clones-javascript-structuredclone
coverImage: ./images/deep-clones-javascript-structuredclone/cover.jpg
pubDate: 2023-03-06T19:31:32.361Z
description: Learn how to make deep clones in JavaScript.
youTubeVideoId: wAj074hO_3g
tags:
  - javascript
---

In JavaScript, there are several ways to make a deep clone of an object. Some of them are a little hacky and some require third-party libraries, but did you know that there's now a built-in function that can do all of that for you? In this post, we'll explore the new `structuredClone` function in JavaScript and how it can be beneficial for making deep clones of objects.

## Understanding Deep Clones in JavaScript

Before diving into the new function, it's essential to understand why deep clones are important in JavaScript. Deep clones are used to create a complete and independent copy of an object, including all of the nested objects and properties. **Without a deep clone, any changes made to the copy will also affect the original object because they share the same memory space.**

## The Problem with Direct Assignment and Using the Spread Operator

Let's illustrate the issue with direct assignment and using the spread operator when making copies of objects. Suppose we start with a person object that has two properties, name and age of 32.

```javascript
const person1 = { name: "James", age: 32 };
```

If we make a direct assignment to create a copy of the object, like `person2 = person1`, it results in both variables pointing to the same object in memory. You can see this in this screenshot where updating `person2` also updates `person1` since they are both pointing to the same object.

![](/images/posts/deep-clones-javascript-structuredclone/1.jpeg) In contrast, using the spread operator to spread out the properties of `person1` into a new object for `person2` will create a copy. However, as the spread operator only goes one level deep, any nested objects within the person object will still result in a shallow copy where the nested object is still being shared.

```javascript
const person2 = { ...person1 };
```

Here’s a quick example where it fails to make a deep copy. Notice that `person1` has a nested `spouse` property that is an object and is effected when updated from `person2`

![](/images/posts/deep-clones-javascript-structuredclone/1.jpeg)

## The Json Stringify Hack

A popular method that developers have been using to make deep clones of objects is the “JSON Stringify Hack”. Using this method, we stringify the object we want to copy and then parse it back into JSON.

```javascript
let obj2 = JSON.parse(JSON.stringify(obj1));
```

The JSON Stringify Hack works for many use cases but fails to work for uniqueness cases like using dates or handling circular references, functions, undefined values, etc.

## The Lodash Clone Deep Function

Lodash is a third-party library used to make deep clones of objects. It has a `cloneDeep()` function that you can call. Still, the downside is that it requires you to add the library to your project, making it an external dependency.

```javascript
import _ from "lodash";
const person2 = _.cloneDeep(person1);
```

## The Structured Clone Function in JavaScript

The `structuredClone` function is now built into the browser for deep cloning of objects. It's a simple function call where you pass in the object you want to clone, and it returns a deep copy of the original value.

```javascript
const person2 = structuredClone(person1);
```

The structured clone function can clone any object, including DOM nodes, and handles circular references. It returns a new object with the same properties and values, but any changes made to the clone will not affect the original object.

## Browser Support

![](https://cdn.videotapit.com/qtXU9lWoHrFMJ8LBuh2j-321.45.png)According to caniuse.com, structured clone has good support across modern browsers in Chrome, Edge, Safari, Firefox, and Opera.

## Conclusion

In summary, deep cloning of objects is crucial when working with JavaScript objects. While there have been various methods to make deep clones of objects, the new 'structuredClone' function in JavaScript makes it easier to do so with minimal dependencies on third-party libraries. Give it a try in your next project and see how it can simplify your code.
