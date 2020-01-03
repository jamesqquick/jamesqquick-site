---
title: Build a Pokedex with Vanilla JavaScript Part 2
slug: /blog/build-a-pokedex-with-vanilla-javascript-part-2
publishDate: 10/01/2019
tags: javascript, vanilla javascript
coverImage: ./images/cover.png
published: true
---

<!-- ![Cover image](./images/cover.png) -->

`youtube:https://www.youtube.com/embed/L0pPRauLP2E`

In [Part 1](https://dev.to/jamesqquick/build-a-pokedex-with-vanilla-javascript-358m) of this series, we used the Poke API to display name, image, and type for the original 150 Pokemon. I had a ton of fun with that but realized there are a few improvments we could make. Here's what we are going to change.

- cut down the number of API requests
- create a custom popup to display Pokemon details
- create a custom cache to further minimize API requests

> Check out the [starter code](https://codepen.io/jamesqquick/pen/NWKaNQz)  and [finished code](https://codepen.io/jamesqquick/pen/PoYXYVG) for reference

## Optimize API Requests

In [Part 1](https://dev.to/jamesqquick/build-a-pokedex-with-vanilla-javascript-358m), I thought it was necessary to make an API requests to get name, image, and type for each Pokemon. I knew it was possible to get the names of the first 150 Pokemon with one request, but I didn't know how to get the image. Turns out, the only thing that changes in the image URL for each Pokemon is the Pokemon id. Shoutout to @leewarrickjr for sharing this.

For example, if I wanted the image for Bulbasaur (id of one), the url looks like this.

> https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/**1**.png

And the image URL for Ivysaur looks like this.

> https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/**2**.png

Notice the only difference is in the id in the image name. After figuring that out, I realized I could make one request to get the names of each Pokemon and then calculate the image URL myself. **This will save 149 initial requests :)**

To get the names of all the Pokemon, you can pass a limit query parameter to the API. It looks like this.

> https://pokeapi.co/api/v2/pokemon?limit=150

So, inside of the _fetchPokemon()_ function, we will make a fetch request to that endpoint.

```javascript
const fetchPokemon = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=150`;
  const res = await fetch(url);
  const data = await res.json();
};
```

> Notice the use of [Async/Await](https://alligator.io/js/async-functions/). It allows us to write synchronous looking JavaScript that is in fact still asynchronous.

After we fetch the data, we now need to convert it to the format we can work with. That said, the API response has a results array, and each item in the array has a name and url. We want to grab both of those properties and add a property for the image url.

Here's what we will do.

- use Array.map to visit and convert each result item
- copy name property from the result into a new object
- create an id property by using the array index and adding 1
- generate the image url property for the object by using the id of the Pokemon

```javascript
const pokemon = data.results.map((data, index) => ({
  name: data.name,
  id: index + 1,
  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index +
    1}.png`,
}));
```

After we've got the Pokemon data correct, we will need to call _displayPokemon()_. Here's what the full function looks like.

```javascript
const fetchPokemon = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=150`;
  const res = await fetch(url);
  const data = await res.json();
  const pokemon = data.results.map((data, index) => ({
    name: data.name,
    id: index + 1,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index +
      1}.png`,
  }));

  displayPokemon(pokemon);
};
```

With that part done, we need to change the way we display the Pokemon. Because we no longer have a type property (we'll come back to this), we can get rid of it in our display. Simply remove that line from the HTML string.

The _displayPokemon()_ function looks like this now.

```javascript
const displayPokemon = pokemon => {
  const pokemonHTMLString = pokemon
    .map(
      pokeman =>
        `
    <li class="card">
        <img class="card-image" src="${pokeman.image}"/>
        <h2 class="card-title">${pokeman.id}. ${pokeman.name}</h2>
        </a>
    </li>
        `
    )
    .join("");
  pokedex.innerHTML = pokemonHTMLString;
};
```

## Create a Custom Popup

At this point, the application is still the same except for two things. We aren't displaying the type for each Pokemon, but we did save 149 API requests! Now, we need to figure out how to retrieve detailed Pokemon info and display it. To do this, we will create a popup.

Here's what will happen.

- the user clicks on a Pokemon
- we make an API request for the details
- display the details in the popup

To get started, we need to add a click event to the Pokemon li. Let's set the click handler to a function called selectPokemon. Inside of that function, we need to pass the id of the Pokemon.

```javascript
<li class="card" onclick="selectPokemon(${pokeman.id})">
```

Then, create the selectPokemon function which will take a parameter of id. Mark it as _async_ since we will be making an asynchronous request using Async/Await again. Inside of that function, we will make the request for the Pokemon details.

```javascript
const selectPokemon = async id => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const pokeman = await res.json();
};
```

Then, we will call _displayPokemanPopup(),_ passing in the detailed information. The full _selectPokemon()_ function looks like this.

```javascript
const selectPokemon = async id => {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const pokeman = await res.json();
  displayPokemanPopup(pokeman);
};
```

Now, we can work on the function to display the detailed information, _displayPokemanPopup()._ Let's start by generating the comma separated list of types. It's a bit tricky, but we covered this in the part one.

```javascript
const type = pokeman.types.map(type => type.type.name).join(", ");
```

Now, we can start to generate the HTML for the popup. It's almost exactly the same as the original HTML with a few small changes.

- the Pokemon card will be wrapped inside of a popup div
- there will be a close button
- we will display more details - type, height, and weight

Here's what we get.

```javascript
const htmlString = `
        <div class="popup">
            <button id="closeBtn" onclick="closePopup()">Close</button>
            <div class="card">
                <img class="card-image" src="${
                  pokeman.sprites["front_default"]
                }"/>
                <h2 class="card-title">${pokeman.name}</h2>
                <p><small>Type: ${type} | Height:</small> ${
  pokeman.height
} | Weight: ${pokeman.weight}</p>
            </div>
        </div>
`;
```

Notice, there's a click handler for the close button. We'll come back to that in a second. Also, notice that we displayed the new details (type, height, and weight) on one line separated by pipes.

The last thing to do is actually display that newly generated HTML. We will prepend this to the ul element with an id of _pokedex_ like so.

```javascript
pokedex.innerHTML = htmlString + pokedex.innerHTML;
```

The full function looks like this.

```javascript
const displayPokemanPopup = pokeman => {
  console.log(pokeman);
  const type = pokeman.types.map(type => type.type.name).join(", ");
  const htmlString = `
        <div class="popup">
            <button id="closeBtn" onclick="closePopup()">Close</button>
            <div class="card">
                <img class="card-image" src="${
                  pokeman.sprites["front_default"]
                }"/>
                <h2 class="card-title">${pokeman.name}</h2>
                <p><small>Type: ${type} | Height:</small> ${
    pokeman.height
  } | Weight: ${pokeman.weight}</p>
            </div>
        </div>
    `;
  pokedex.innerHTML = htmlString + pokedex.innerHTML;
};
```

At this point, if you a Pokemon, you should see the details being displayed at the top of the page. To hide those details, we can implement the _closePopup()_ function. Inside of this function, we want to find the newly generated DOM element that has the class of popup.

```javascript
const closePopup = () => {
  const popup = document.querySelector(".popup");
  popup.parentElement.removeChild(popup);
};
```

## Styling the Popup

Now that we are able to retrieve and display Pokemon details, we need to style it to be an actual Popup. The popup, as you would expect, will cover the entire screen and sit on top of the rest of the content.

Over in the .css file, let's start with styling the div itself. Here's what we need to do.

- use position static along with height and width to cover the screen
- add a bit of transparency (personal preference)
- use flexbox to center the content inside the popup

Here's the styles for the popup.

```css
.popup {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: #f4f4f4;
  opacity: 0.95;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

Next, can we style the close button to place it in the top right and make it look all pretty with a little hover effect!

```css
#closeBtn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: orangered;
  padding: 10px 20px;
  border: none;
  color: white;
  border-radius: 3px;
  transition: transform 100ms;
}

button:hover {
  cursor: pointer;
  transform: translateY(-1px);
  box-shadow: 0px 1px 2px darkred;
}
```

## Caching Data for Better Performance

Now they we've got the functionality there, we can add a bit of logic to further optimize  the app. Currently, we are making an API request each time we click on a Pokemon. This means if we click on the same Pokemon 100 times, we will make the same exact request 100 times. We can improve this by caching the data for each Pokemon after we retrieve it. Here's how it works.

- cache Pokemon in a JavaScript object with the keys being the Pokemon id
- save Pokemon data to the cache the first time we click on one
- read data from the cache on subsequent clicks

Start by initializing a cache variable to any empty object at the top of the JavaScript file.

```javascript
const cachedPokemon = {};
```

Now, we need to add logic to the _selectPokemon()_ function. Let's start by adding the Pokemon data to the cache after we retrieve it.

```javascript
cachedPokemon[id] = pokeman;
```

Then, we can add the logic to use the cached data if available instead of making the API request. The finished function looks like this.

```javascript
const selectPokemon = async id => {
  if (!cachedPokemon[id]) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const res = await fetch(url);
    const pokeman = await res.json();
    cachedPokemon[id] = pokeman;
    displayPokemanPopup(pokeman);
  } else {
    displayPokemanPopup(cachedPokemon[id]);
  }
};
```

## Wrap Up

What's more fun than getting to build an application about Pokemon?! I had a lot of fun with this one figuring out how to hack pieces together with Vanilla JavaScript. Let me know what you thought in the comments!
