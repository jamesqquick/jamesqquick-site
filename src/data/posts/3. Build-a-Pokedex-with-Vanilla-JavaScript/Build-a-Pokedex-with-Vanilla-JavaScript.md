---
title: Build a Pokedex with Vanilla JavaScript
slug: /blog/build-a-pokedex-with-vanilla-javascript
publishDate: 09/3/2019
tags: javascript, vanilla javascript
coverImage: ./images/cover.png
published: true
---

<!-- ![Cover image](./images/cover.png) -->

`youtube:https://www.youtube.com/embed/T-VQUKeSU1w`

Front-end frameworks like React get lots of attention, but you don't always need one. In this article, I'm going to combine my love for two things, JavaScript and Pokemon. We are going to build a Pokedex for the original 150 pokemon using vanilla HTML, CSS, and JavaScript.

<!-- ![Pokemon Pokedex](./images/pokedexapp.jpg) -->

> Check out the [Codepen](https://codepen.io/jamesqquick/pen/NWKaNQz) for source code!

## Scaffold the Project

This project will not have many files, namely an **index.html**, **app.css**, and an **app.js**. That said, to get started, create a folder on your computer and open it with your favorite editor. Mine is [VS Code](https://code.visualstudio.com)!

With the folder open, you'll need to create the three files from above.

- index.html
- app.css
- app.js

> Try out the VS Code extension [Web Boilerplate](https://marketplace.visualstudio.com/items?itemName=jamesqquick.web-boilerplate), which can generate these three files for you

With these files created, you'll now need to link to the CSS and JavaScript files inside of the index.html. Your HTML code will look like this.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Quick's Pokedex</title>
    <link rel="stylesheet" href="app.css" />
  </head>
  <body>
    <script src="app.js"></script>
  </body>
</html>
```

With the boilerplate code taken care of, we can start to add a bit of content to the page. Start by adding a **div** with a class of **container** inside of the body. This is where we will put all our content.

Inside of the container div, add an **h1** element with the name of your app. I call mine "Quick's Pokedex". Lastly, add an **ol** element with an id of **pokedex**_._ This ordered list is where we are going to display all the Pokemon information.

Here's what your HTML file should look like.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Quick's Pokedex</title>
    <link rel="stylesheet" href="app.css" />
    <link
      href="https://fonts.googleapis.com/css?family=Rubik&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="container">
      <h1>Quick's Pokedex</h1>
      <ol id="pokedex"></ol>
    </div>
    <script src="app.js"></script>
  </body>
</html>
```

## Fetch Pokemon Data using the PokeAPI

Believe it or not that's everything we will add to the HTML page. Now, we move on to JavaScript where we will load Pokemon data from the [PokeAPI](https://pokeapi.co). To do this, we will use [JavaScript Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to make HTTP requests to the API.

> For a refresher on the Fetch API, check out [JavaScript Fetch API - Getting Started!](https://www.youtube.com/watch?v=uBR2wAvGces&t=1s)

Let's start by looking at how the API works. To get information about a specific Pokemon, you make the request and pass the id of that Pokemon. So, if you want to get information about Bulbasaur (number 1), you would make the request adding 1 to the end like so.

https://pokeapi.co/api/v2/pokemon/1

This works well enough, but we are going to want information about 150 Pokemon, not just one. To do this, we can iterate through numbers 1-150 and make the API request for each one. Here's a snippet of what this might look like.

```javascript
for (let i = 1; i <= 150; i++) {
  const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
  fetch(url)
    .then(res => res.json())
    .then(pokemon => {
      console.log(pokemon);
    });
}
```

Here's a couple of things to notice in that code. We used ES6 template literal strings to append the value of _i_ (the index) to the end of each request. Also, we had to convert the initial Fetch response to a JavaScript object by calling **res.json()**. We use "promise chaining" to accomplish this.

> For a refresher on JavaScript promises, check out [JavaScript Promises - Getting Started](https://www.youtube.com/watch?v=gyC19H4ip1k)

In the end, we get access to the **pokemon** variable which holds the data for the pokemon. There's one big problem here though. This is a **very inefficient** way to make so many API requests. Because the API call is inside of a For Loop, we have to wait for each one to finish before making the next.

> Typically, you shouldn't make asynchronous calls inside of a For Loop.

We can update this by using [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Promise.all() allows us to run asynchronous API calls in parallel instead of sequentially. This means that the time it takes to make 150 requests will be about the same as making 1! That's a drastic improvement!

Here's what the code for this looks like.

```javascript
const promises = [];
for (let i = 1; i <= 150; i++) {
  const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
  promises.push(fetch(url).then(res => res.json()));
}

Promise.all(promises).then(results => {
  console.log(results);
});
```

This might seem a bit complicated, so let's break down the steps.

1.  Create an empty array to hold the promises
2.  Iterate 1-150
3.  Make the API request which returns a promise
4.  Add that promise to the promises array
5.  Use Promise.all() to wait for all requests to finish (in parallel)
6.  Get access to an array of Pokemon info with the **results** variable

## Converting the Pokemon Data

With the Pokemon data loaded, we now need to convert it to a format that we want to work with. For example, for each Pokemon object that gets returned, there is lots of unnecessary data. We only care about a few properties.

- name
- id
- type
- image

In general, we want to convert the array of data from our requests to an array of Pokemon data with only the info above. We can use the [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) function to handle this conversion.

> Anytime you want to convert each item in an array, think [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)!

```javascript
const pokemon = results.map(data => ({
  name: data.name,
  id: data.id,
  image: data.sprites["front_default"],
  type: data.types.map(type => type.type.name).join(", "),
}));
```

As you can see, we retrieved most of the data we need without much effort. Yet, the type data is not so easy. The incoming Pokemon data represents types as an array, but we want a comma separated string. For this conversion, we can use the **map()** Array function combined with a **join()** String function**.**

```javascript
type: data.types.map(type => type.type.name).join(", ");
```

## **Display Pokemon Data**

Now that we have the converted Pokemon data, it's time to display it on the screen. It might seem a bit odd, but we will do this by generating an HTML string using JavaScript. This string represents the HTML content to go inside of the **ol** element. Here are the steps we are going to follow.

1.  Create a function called displayPokemon
2.  Call this function from fetchPokemon passing the Pokemon data as the parameter
3.  Use Array **map()** to convert each Pokemon object to an **li** element string
4.  Use String **join()** to join all the element strings
5.  Get a reference to the **ol** element in JavaScript
6.  Set the  **innerHTML**  of the **ol** element to the generated string

Start by creating a function called displayPokemon that takes a parameter called **pokemon**.

```javascript
const displayPokemon = pokemon => {};
```

Call the new function from within fetchPokemon. Make sure to pass the **pokemon** variable as the parameter.

```javascript
Promise.all(promises).then(results => {
  const pokemon = results.map(data => ({
    name: data.name,
    id: data.id,
    image: data.sprites["front_default"],
    type: data.types.map(type => type.type.name).join(", "),
  }));
  displayPokemon(pokemon);
});
```

Now, we will generate the HTML string by using **map()** and **join()**. Because we are using [ES6 Template Literal strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) we can do a couple of useful things. We can have the string span many lines and keep correct formatting. We can also inject variables into the string using string interpolation. Lastly, notice that we are applying classes to the elements that we create. We will use these classes to add style in the next section.

```javascript
const pokemonHTMLString = pokemon
  .map(
    pokeman =>
      `
    <li class="card">
        <img class="card-image" src="${pokeman.image}"/>
        <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
        <p class="card-subtitle">Type: ${pokeman.type}</p>
    </li>
    `
  )
  .join("");
```

At the top of the file, you will need to get a reference in JavaScript to the **ol** element with an id of **pokedex**.

```javascript
const pokedex = document.getElementById("pokedex");
```

Now, set the innerHTML of the **ol** element to the HTML string that we generated.

```javascript
pokedex.innerHTML = pokemonHTMLString;
```

Here's what the entire function looks like.

```javascript
const displayPokemon = pokemon => {
  console.log(pokemon);
  const pokemonHTMLString = pokemon
    .map(
      pokeman =>
        `
    <li class="card">
        <img class="card-image" src="${pokeman.image}"/>
        <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
        <p class="card-subtitle">Type: ${pokeman.type}</p>
    </li>
    `
    )
    .join("");
  pokedex.innerHTML = pokemonHTMLString;
};
```

## Style Pokemon Cards

All the Pokemon data is being displayed now, but it's not pretty! Let's jump into the css to start adding some styles.

Let's start by adding some basic styles to the body, mainly for font and background color.

```css
body {
  background-color: orangered;
  margin: 0;
  font-family: rubik;
  color: white;
}
```

For the font, I'm referencing a Google font called **Rubik**. If you want to use it as well, you'll need to add the following line to the head section of your HTML file.

```html
<link
  href="https://fonts.googleapis.com/css?family=Rubik&display=swap"
  rel="stylesheet"
/>
```

Next, we can add some style to our content container. This will give some breathing room to the content.

```css
.container {
  padding: 40px;
  margin: 0 auto;
}
```

We also will add a bit of styling to the title of the app.

```css
h1 {
  text-transform: uppercase;
  text-align: center;
  font-size: 54px;
}
```

Then, we add the base styles for the Pokedex "cards".

```css
.card {
  list-style: none;
  padding: 40px;
  background-color: #f4f4f4;
  color: #222;
  text-align: center;
}

.card-title {
  text-transform: uppercase;
  font-size: 32px;
  font-weight: normal;
  margin-bottom: 0;
}

.card-subtitle {
  font-weight: lighter;
  color: #666;
  margin-top: 5px;
}

.card-image {
  height: 180px;
}
```

Those are starting to look a bit better, but we want to be able to display the grid as a grid that will adapt to screen sizes. To do this, we will use [CSS Grid](https://www.w3schools.com/css/css_grid.asp). We won't go into much detail of CSS Grid here. . If you are looking for additional material, I recommend these two resources.

1.  [CSS Grid](https://cssgrid.io) from Wes Bos
2.  [Practical CSS Grid](https://www.udemy.com/course/practical-css-grid/) by Bryan Robinson

In general, we want to display the cards horizontally with each having a minimum width of 320px. If the widths become to big for the screen, cards should wrap to the next row. We can achieve this with the following styles.

```css
#pokedex {
  padding-inline-start: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-gap: 20px;
}
```

## Animate Pokemon Card on Hover

The very last thing we will do in this tutorial is add an animation to the Pokemon when the user hovers on one. This adds a fun touch of interaction when someone is scrolling through.

Let's apply an animation to the card on hover.

```css
.card:hover {
  animation: bounce 0.5s linear;
}
```

Now, we need to create the animation. It will be a simple bounce effect. This animation will move the card up and back down twice.

```css
@keyframes bounce {
  20% {
    transform: translateY(-6px);
  }
  40% {
    transform: translateY(0px);
  }
  60% {
    transform: translateY(-2px);
  }
  80% {
    transform: translateY(-0px);
  }
}
```

## Wrap Up

That's it. You should have a functioning Pokedex, created with Vanilla HTML, CSS, and JavaScript. See, you don't always need a framework to create something fun!
