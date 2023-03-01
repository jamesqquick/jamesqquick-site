---
title: React Router in 5 Minutes
slug: react-router-in-five-minutes
coverImage: /images/posts/react-router-in-five-minutes/cover.png
pubDate: 2020-06-09
description: Learn how to setup React Router in 5 minutes!
youTubeVideoId: yQf1KbGiwiI
tags: react
---

I use React all of the time and always have to look up how to setup React Router. In this post, I'll show you how to setup React Router in five minutes.

## Install the Package

First, you'll have to install the `react-router-dom` package on npm with the following command.

```sh
npm install react-router-dom
```

## Add Routes in App.js

To add the routes, we need to import the `BrowserRouter` and `Route` components from the package. Often, you'll see `BrowserRouter` renamed as `Router` as it is below.

```javascript
import { Route, BrowserRouter as Router } from "react-router-dom";
```

Now, wrap the app in the `Router` component.

```javascript
function App() {
  return <Router></Router>;
}
```

Inside of the `Router` component, you can add a `Route` component for each of your routes where you define the path and display component for each. I also surrounded mine with a container div for ensuring consistent padding on each page. Lastly, I marked the index route with the `exact` property to avoid conflicts with sub routes.

```javascript
function App() {
  return (
    <Router>
      <div className="container">
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={Blog} />
      </div>
    </Router>
  );
}
```

Typically, you'll have something like a Navbar component that you want to display on every page. To include a component on each page, add it inside of the `Router` along side your routes.

```javascript
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={Blog} />
      </div>
    </Router>
  );
}
```

## Navbar component

With React Router, to link to different pages in your app, you'll need to use the `Link` component instead of traditional anchor tags. Import it like so.

```javascript
import { Link } from "react-router-dom";
```

You'll use these in your Navbar and other areas in your app. Here's what they'll look like wherever you decide to use them. Just specify the `to` property which is the path of the page to navigate to.

```javascript
<Link to="/about">Home</Link>
```

## Wrap up

That's it. Not too bad. You should be up and running with page navigation in your React app.
