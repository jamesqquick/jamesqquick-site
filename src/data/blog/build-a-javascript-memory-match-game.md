---
title: Build a JavaScript Memory Match Game
slug: build-a-javascript-memory-match-game
coverImage: ./images/build-a-javascript-memory-match-game/cover.png
pubDate: 2022-08-25
description: Learn how to build a memory match game with JavaScript
youTubeVideoId: Z2O3QxpcdSk
tags:
  - javascript
---

In this tutorial, we’re going to build a PokeMatch game with vanilla HTML, CSS, and JavaScript. The Pokemon API is free and fun to work with, so let’s get started.

> This is an abridged version of the tutorial. [Watch the full tutorial on YouTube](https://youtu.be/Z2O3QxpcdSk). You can find the full source code [here](https://github.com/jamesqquick/javascript-memory-match).

## Set Up

Open a blank folder in your favorite text editor (VSCode for me). Then, create three files.

- index.html
- app.js
- app.css

> This blog post is powered by [Contenda](https://contenda.co/) which can transform videos into blog posts including images, code snippets, and more! You can get early access and one FREE content transformation using [this onboarding link](https://contenda.co/jamesqquick).

In the HTML file, stub out a basic template with a few elements.

- references to both `app.css` and `app.js`
- `div` with a class of `container` to wrap everything
- a `header` for the title and a reset button that calls a `resetGame` function
- an empty `div` with an id of `game`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Pokemon Memory Match Game</title>
    <link rel="stylesheet" href="app.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <h1>PokeMatch</h1>
        <button onclick="resetGame()">Reset</button>
      </header>
      <div id="game"></div>
    </div>
    <script src="app.js"></script>
  </body>
</html>
```

> \*\*TIP\*\* You can use the ‘`live server`’ extension in VS Code to get a live reloading server running. By default it runs on port 5501.
> This is all the markup we’ll need for now. We’ll dynamically generate the board in JavaScript.

## Getting your Pokemon

In the `app.js` file, we’ll need to work with the [Pokemon API](https://pokeapi.co/) to get information on 8 different Pokemon for each iteration of the game. We’ll use this Pokemon API endpoint:

```
https://pokeapi.co/api/v2/pokemon/{id}
```

We'll need 3 key properties about each pokemon.

- ID
- sprites (images)
- type

First, we’re going to create a new function called `loadPokemon` which will make a `fetch` request to the API for 8 random Pokemon. This function will use `async/await` so we can go ahead and mark it as `async`.

We’ll start by making a request to the PokeAPI based URL and then add on the string of the Pokemon we want to fetch. For example, if we want to fetch information for Bulbasaur, we would add 1 to the end of the URL.

```javascript
const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";

const loadPokemon = async () => {
  const res = await fetch(pokeAPIBaseUrl + "1");
  const pokemon = await res.json();
};
```

Now, we need to generate an array of random Pokémon IDs, then iterate through the array to make a fetch request for each one. We can use a `set` to take care of any duplicate IDs and `Match.random()` to generate random numbers.

> A [set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) is an object data structure that doesn’t allow for duplicates and has a constant lookup time.

```javascript
const randomIds = new Set();
while (randomIds.size < 8) {
  const randomNumber = Math.ceil(Math.random() * 150);
  randomIds.add(randomNumber);
}
```

Then, we'll take that set of random Ids and make a request to the Pokemon API for each one. For performance benefits, we are going to use `Promise.all()` which will let the different API requests happen in parallel. Here's the final `loadPokemon` function.

```javascript
const loadPokemon = async () => {
  const randomIds = new Set();
  while (randomIds.size < 8) {
    const randomNumber = Math.ceil(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
  const results = await Promise.all(pokePromises);
  return await Promise.all(results.map((res) => res.json()));
};
```

Let's create a `displayPokemon` function to display the cards. This function will:

- sort the pokemon in a random order using this trick - `pokemon.sort( _ => Math.random() - 0.5);`
- iterate through each Pokemon using `Array.map()`
- convert each Pokemon to an HTML template string
- call `join` on the resulting array to generate one HTML string that includes all of the Pokemon cards

```javascript
const displayPokemon = (pokemon) => {
    pokemon.sort( \_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
    return '
        <div class ="card">
        <h2>${pokemon.name}
    </div>
    '
    }).join('');
}
```

With the HTML string generated, we now need to set it as the `innerHTML` property of the game `div`.

```javascript
const game = document.getElementById('game');
...

const displayPokemon = (pokemon) => {
    pokemon.sort( _ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
    return '
            <div class ="card">
                <h2>${pokemon.name}
            </div>
        '
    }).join('');
    game.innerHTML = pokemonHTML;

}
```

Now, let's create a `resetGame` function that will load the Pokemon and then call `displayPokemon`. Since this is a match game, we'll need two cards for each Pokemon. For this, we can create a new array with two copies of the `loadedPokemon` using the Spread operator.

```javascript
const resetGame = async () => {
  game.innerHTML = "";
  const loadedPokemon = await loadPokemon();
  displayPokemon([...loadedPokemon, ...loadedPokemon]);
};
```

## Basic Styling

Let's start to style our app with CSS.

This is optional, but for fun, I downloaded a [free Pokemon font](https://www.dafont.com/pokemon.font). After downloading the `Pokemon.TTF` and adding it to the root of your directory, you can use it to your CSS.

```css
@font-face {
  font-family: pokemon;
  src: url(pokemon.ttf);
}
```

Now for the game container. Let's use [Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) to center the content on the screen as well as a few additional styles.

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  font-family: pokemon;
  letter-spacing: 5px;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
}
```

Now, for the header. We can use Flexbox again here to center the title and the reset button vertically and spread them apart. We can also make the title a bit bigger.

```css
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

h1 {
  font-size: 54px;
}
```

## Styling the Pokemon Cards

First, let's style the game as grid of four by four with a bit of gap between each.

```css
#game {
  display: grid;
  grid-template-columns: repeat(4, 160px);
  grid-template-rows: repeat(4, 160px);
  grid-gap: 10px;
}
```

Now, for our individual card, we’ll add a `box-shadow`, `border-radius`, and `position`.  
We’ll also set the `overflow` to be hidden.

There's one additional property `transform-style` that we'll add. This will allow us to make the flipping animations look 3d.

```css
.card {
  box-shadow: 0 3px 10px rgba(200, 200, 200, 0.9);
  border-radius: 10px;
  position: relative;
  transform-style: preserve-3d;
  overflow: hidden;
}
```

## Animating and Styling the Cards

Let's work on the flip animation to show the front and back of each card.  
Inside of the markup for each card, we'll add two containing divs, one for the front, and one for the back.

For the front of the card, I grabbed in image of a Pokeball to display. We'll do this in CSS. You can grab that from the [source code](https://github.com/jamesqquick/javascript-memory-match) if you want to add it.

For the back of the card, we'll display the image of the Pokemon and their name. The back of the card will also have a class of `rotated`. We'll toggle this class to trigger the animation in JavaScript.

Lastly, we'll add two properties to the container card.

- an `onclick` property that calls a `clickCard` function (we'll create this shortly)
- a custom data property called `data-pokename` - we'll use this to determine the name of the Pokemon that was clicked

```html
<div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}">
  <div class="front"></div>
  <div class="back rotated">
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h2>${pokemon.name}</h2>
  </div>
</div>
```

Let's style the front of the card in CSS to add the background image.

```css
.front {
  background-image: url("/pokeball.png");
  background-position: center;
  background-repeat: no-repeat;
  background-color: black;
}
```

We can also add some general styling that applies to both the front and back of the cards.

- Flexbox for centering the content
- position of `absolute` and a height and width set to 100%
- transition to make the flip smooth

One interesting property that we will set is [backface-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility) property to `hidden`. This will be used to make sure only the back or the front will show at a time.

```css
.card > .front,
.card > .back {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  height: 100%;
  width: 100%;
  backface-visibility: hidden;
  transition: transform 0.5s;
}
```

## Flipping the Card

Let's now create the `clickCard` function. We'll need to know which card was clicked. We can do this by grabbing a reference to `e.currentTarget`. We can then find the name of the Pokemon from the custom data property we created.

```javascript
const clickCard = (e) => {
  const pokemonCard = e.currentTarget;
  const pokemonName = pokemonCard.dataset.pokename;
};
```

To flip this card, we need to get the front and back elements of the card. We'll then flip these by toggling the `rotated` class. Here's a little helper function that uses a query selector to get the front and back elements.

```javascript
const getFrontAndBackFromCard = (card) => {
  const front = card.querySelector(".front");
  const back = card.querySelector(".back");
  return [front, back];
};
```

And here's a helper function for toggling the `rotated` class on an array of elements.

```javascript
const rotateElements = (elements) => {
  if (typeof elements !== "object" || !elements.length) return;
  elements.forEach((element) => element.classList.toggle("rotated"));
};
```

From there, we can toggle the front and the back like so.

```javascript
const clickCard = (e) => {
  const pokemonCard = e.currentTarget;
  const [front, back] = getFrontAndBackFromCard(pokemonCard);
  const pokemonName = pokemonCard.dataset.pokename;
  rotateElements([front, back]);
};
```

## Adding More Game Logic

Now that we can flip the front and back of one card, we need to add extra game logic to take two cards into account. This is core to how memory match games work because we'll need to keep track of two cards at a time.

After a card is clicked, we'll track it by storing the card element in a variable called `firstPick`. We can then check to see whether or not there is an existing card that has been clicked to determine what to do next. We can also ignore the clicking of a card if it has already been clicked by checking if its front element already has a class of `rotated`.

```javascript
const firstPick = null;
...

const clickCard = (e) => {
    const pokemonCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard)

    if(front.classList.contains("rotated")) {
    return;
    }
    rotateElements([front, back]);

    if(!firstPick){
    //track the clicked card
    firstPick = pokemonCard;
    }else {
    //check for matches
    }
}
```

Let's now handle the scenario where the user is clicking the second card. We want to check if that card matches the first clicked card. If so, we leave them flipped. If not, we flip them back. We'll put the flipping part inside of `setTimeout` to give it a bit of a delay.

```javascript
else {
    const firstPokemonName = firstPick.dataset.pokename;
    const secondPokemonName = pokemonCard.dataset.pokename;
    if(firstPokemonName !== secondPokemonName) {
    const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
    setTimeout(() => {
        rotateElements([front, back, firstFront, firstBack]);
        firstPick = null;
    }, 500)
    }
}
```

And what if the cards do match? Well, let's keep track of how many matches the user has gotten so far with a variable called `matches`. Then, if that number reaches 8, the user has won. Here's what the full function looks like.

```javascript
let matches = 0;
...

const clickCard = (e) => {
    const pokemonCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard)
    if(front.classList.contains("rotated")) {
    return;
    }
    isPaused = true;
    rotateElements([front, back]);
    if(!firstPick){
    firstPick = pokemonCard;
    }
    else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;
    if(firstPokemonName !== secondPokemonName) {
        const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
        setTimeout(() => {
            rotateElements([front, back, firstFront, firstBack]);
            firstPick = null;
        }, 500)
    }else {
        matches++;
        if(matches === 8) {
            console.log("WINNER");
        }
        firstPick = null;
    }
    }
}
```

Lastly, we can update the `resetGame` function to appropriately reset the game state. Then, we'll call the `resetGame` function to start the game.

```javascript
const resetGame = async () => {
  game.innerHTML = "";
  firstPick = null;
  matches = 0;
  const loadedPokemon = await loadPokemon();
  displayPokemon([...loadedPokemon, ...loadedPokemon]);
};

resetGame();
```
