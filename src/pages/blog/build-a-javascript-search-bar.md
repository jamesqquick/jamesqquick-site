---
layout: '../../layouts/BlogPostLayout.astro'
title: Build a JavaScript Search Bar
slug: build-a-javascript-search-bar
coverImage: /images/posts/build-a-javascript-search-bar/cover.png
pubDate: 2020-02-04
description: Learn how to build a search bar in JavaScript to search/filter through data.
youTubeVideoId: wxz5vJ1BWrc
---

Searching is one of the most common things you do on the internet. At some point, you'll probably want to incorporate search into your own app. In this article, let's learn how to create a search bar to filter content with vanilla JavaScript.

> Check out the finished code [here](https://codepen.io/jamesqquick/pen/XWJxBQv)

## Project Setup

For this demo, we will use the [Harry Potter API](http://hp-api.herokuapp.com/api/characters) to search/filter Harry Potter characters. I've created a starter [Code Pen](https://codepen.io/jamesqquick/pen/bGNXYxx) that you can use to make sure we all start from the same point. This starter code provides basic styling and the logic to retrieve and display the characters.

## Retrieving User Input

The most important concept in this article is learning how to retrieve user input from a text box. To do this, we need to get a reference to the input by its id by using `document.getElementById()`. Add the following line to the top of the JavaScript file.

    const searchBar = document.getElementById("searchBar");

Now that we have a reference to the `searchBar`, we can add a `keyup` event listener to retrieve the input from the user. I'm using ES6 Arrow Function syntax for the callback.

> Learn more about [Arrow Functions in JavaScript](https://www.youtube.com/watch?v=prG68DQobbw&t=265s)

    searchBar.addEventListener("keyup", e => {});

Notice that the callback function has a parameter, `e`. This is the event object. We can access the input from user with `e.target.value`. Assign it to a variable like so.

    searchBar.addEventListener("keyup", e => {
      const searchString = e.target.value;
    });

At this point, you can use `console.log(searchString)` to double-check you are getting the right values.

## Filtering Characters on Search

Now, we can use the search string to perform the search. In our example, we are simply going to filter the HP characters that we have already retrieved. Keep in mind, in other scenarios, you might need to make an additional API request if the original data set is too large to store in memory.

For filtering, we are going to use the JavaScript array `filter()` method. This method will allow us to iterate through each of the characters in our array and decide whether or not it should be shown based on the search string.

> Learn more about [JavaScript Array functions](https://www.youtube.com/watch?v=ALYH5XOvMwI&t=6s)

We are going to allow the user to search by both character name and Hogwarts house. For example, if the user searches `G` characters who are in the Gryffindor house, as well as ones whose name contains a `G`, should be shown. Let's start by stubbing out the filter like so.

    const filteredCharacters = hpCharacters.filter(character => { return true; });

In the snippet above, we are returning `true` for each character which means we aren't filtering at all. As we mentioned earlier, we want to filter based on the character name and house. So, we need to return whether or not the search string is included in each character's house or his/her name.

    const filteredCharacters = hpCharacters.filter(character => {
      return (
        character.name.includes(searchString) ||
        character.house.includes(searchString)
      );
    });

With our filter in place, we now need to display the filtered characters by calling the `displayCharacters()` function. Here's the entire function.

    searchBar.addEventListener("keyup", e => {
      const searchString = e.target.value;
      const filteredCharacters = hpCharacters.filter(character => {
        return (
          character.name.includes(searchString) ||
          character.house.includes(searchString)
        );
      });
      displayCharacters(filteredCharacters);
    });

Now, try a couple of searches.

For example, `Gry` should return all characters in the Gryffindor house.

`Ce` should return Cedric Diggory, Horace Slughorn, and Vincent Crabbe.

## Case Insensitive Search

Although search appears to work, you might have wondered what would happen if you type in a search with all lowercase letters. Turns out, the search wouldn't quite work.

To prove this, search for `harry` and you'll see there aren't any results.

What we most likely want is a case insensitive search, meaning uppercase vs lowercase doesn't matter. When this is the case (pun intended... lol ), the typical strategy is to convert both the search string and the thing you're searching to lowercase. We can update our filter method with case insensitive search like so.

    const searchString = e.target.value.toLowerCase();
    const filteredCharacters = hpCharacters.filter(character => {
      return (
        character.name.toLowerCase().includes(searchString) ||
        character.house.toLowerCase().includes(searchString)
      );
    });

Now, search for `harry` again and you should see Mr. Potter.

## Wrap Up

Hopefully, this gave you a bit of insight into working input DOM elements, the filter function, and case insensitive searches. If not, at least you go to work with a pretty cool Harry Potter API 😋
