---
layout: '../../layouts/BlogPostLayout.astro'
title: JavaScript Array Filter Method Practice in 5 Minutes
slug: javascript-array-filter-explained-in-5-minutes
coverImage: /images/posts/javascript-array-filter-explained-in-5-minutes/cover.png
pubDate: 2021-01-04
description: JavaScript arrays have some powerful built-in methods that simplify working with them. Let's look at the array filter() method.
youTubeVideoId: 3LOEGS4qcRM
---

JavaScript arrays have some powerful built-in methods that simplify working with them. In this article, let's look at the array `filter() `method.

## Getting Started

This post is part of a series focused on learning JavaScript array methods. You can find the starter code in [this repository](https://bit.ly/jqq-array-practice).

![](/images/javascript-array-filter-explained-in-5-minutes/1.png)

In that repository, there is a `worksheet.js` file with some sample Star Wars data. So, clone the repository, open up the `worksheet.js` file, and scroll down to the Filter section. Alternatively, you can copy the sample data into a JavaScript file without cloning if you choose.

Here's the sample data.

```javascript
const characters = [
  {
    name: 'Luke Skywalker',
    height: 172,
    mass: 77,
    eye_color: 'blue',
    gender: 'male',
  },
  {
    name: 'Darth Vader',
    height: 202,
    mass: 136,
    eye_color: 'yellow',
    gender: 'male',
  },
  {
    name: 'Leia Organa',
    height: 150,
    mass: 49,
    eye_color: 'brown',
    gender: 'female',
  },
  {
    name: 'Anakin Skywalker',
    height: 188,
    mass: 84,
    eye_color: 'blue',
    gender: 'male',
  },
];
```

## Array Filter Overview

The filter method returns a new array with only the items that we wish to be included. We tell the filter method which items to include by passing it a callback function. This callback function accepts one parameter (each item in the array), and then we return a boolean of whether or not that item should be included in the filtered results.

For example, if we have an array of numbers and we only want the numbers that are greater than 50, our filter condition would look like this.

```javascript
num > 50;
```

So, the entire filter would look like this.

```javascript
const numbers = [25, 50, 75];
const lessThan50 = numbers.filter((num) => {
  return num > 50;
});
```

Let's take a look at a few exercises.

## 1. Get characters with mass greater than 100

Remember we call filter by passing it a callback function that determines whether or not a given item should be filtered or included. In this case, the condition is `character.mass > 100`. So, our filter will look like this.

```javascript
const greater100Characters = characters.filter((character) => {
  return character.mass > 100;
});
```

Since our callback function has a one-line return, we can simplify this arrow function by omitting the `return` keyword and the function brackets. This syntax implies an implicit return which means that whatever comes after the `=>` will be automatically returned.

```javascript
const greater100Characters = characters.filter(
  (character) => character.mass > 100
);
```

## 2. Get characters with height less than 200

Now, our condition changes a little bit. The condition is `character.height < 200`.

```javascript
const shorterCharacters = characters.filter((character) => {
  return character.height < 200;
});
```

And again, we can use the abbreviated syntax for implicit returns.

```javascript
const shorterCharacters = characters.filter(
  (character) => character.height < 200
);
```

## 3. Get all male characters

Now, we only want to get male characters by checking the `gender` property of each character.

```javascript
const maleCharacters = characters.filter(
  (character) => character.gender === 'male'
);
```

## 4. Get all female characters

Lastly, we can tweak the previous filter to search for the string "female" as the `gender` property.

```javascript
const femaleCharacters = characters.filter(
  (character) => character.gender === 'female'
);
```

## Wrap Up

If you want to learn more about JavaScript, make sure to [subscribe on YouTube](https://www.youtube.com/c/jamesqquick?sub_confirmation=1)!
