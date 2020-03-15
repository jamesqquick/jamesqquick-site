---
title: Setup React Router
slug: /blog/setup-react-router
publishDate: "2020-03-16"
tags: web-development, javascript, react
published: true
coverImage: ../../images/covers/placeholder-cover.jpg
---

I use React all of the time and always have to look up how to setup React Router. In this post, I'll show you how to quickly setup React Router in your React applications.

## Install the Package

You'll need to start by installing the React Router DOM package.

`npm install react-router-dom`

## Wrap Your Application in Router

Open up your `App.js` file. Then, import the necessary objects from the React Router.

```javascript
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
```

Notice that I renamed `BrowserRouter` to `Router`. This is done in most examples for a simpler syntax.

Now, that we have the right imports, wrap your App component with `Router`.

```javascriptfunction App() {
    return (
        <Router>
        </Router>
    );
}
```

You can then include each of your routes inside of the `Router` specifying both the component and the path.

```javascript
function App() {
  return (
    <Router>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/about">
        <About />
      </Route>
      <Route path="/blog">
        <Blog />
      </Route>
    </Router>
  );
}
```

If you don't mark your root route as `exact` you might have it display on other routes as well. To solve this, you can additionally wrap your routes inside of a `Switch` component. This will ensure that only one of these comopnents is displayed at a time.

```javascript
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Home />
        </Route>
        <Route path="/about">
          <about />
        </Route>
        <Route path="/blog">
          <Blog />
        </Route>
      </Switch>
    </Router>
  );
}
```

If you have a header/navbar that you want to include on every page, you can render it just inside of the `Router` component.

```javascript
function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
export default App;
```
