---
title: The Easiest Way to Add Node.js User Authentication
slug: the-easiest-way-to-add-node-js-user-authentication
coverImage: ./images/the-easiest-way-to-add-node-js-user-authentication/cover.jpeg
pubDate: 2020-10-28
description: The easiest way to add user authentication in your Node.js apps. We will use Auth0 to do the hard work of authentication and then add the Express OpenID Connect library to our Node.js app to trigger login/logout workflows, protecting API routes, etc.
youTubeVideoId: QQwo4E_B0y8
tags:
  - nodejs
---

Adding authentication in your Node.js applications can be a daunting task. Even if you're using Passport.js to do some of the heavy lifting, it's still tricky to incorporate. In this article, let's see how to use the [express-openid-connect](https://github.com/auth0/express-openid-connect) library to add authentication to your Node.js/Express application 💪 Trust me, this is by far the easiest way I've found to do this!

## [](#project-setup)Project Setup

We are going to be building a Node.js/Express application that has routes for handling login and logout as well as displaying profile information to the user. Let's start from the very beginning. Create a folder on your computer, and then, in the terminal, run `npm init -y` to set the project up as a JavaScript project.

Then, we'll need to install some dependencies.

- express - server framework
- dotenv - for working with local environment variables
- express-openid-connect - library that handles authentication

```
npm install express dotenv express-openid-connect
```

Then, open the folder up with your favorite text editor. Create an `app.js` file in the root of your directory. Inside of here, add the code to create an express server.

```
const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.send("hello world");
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
```

You can then run the server with `node app.js` or, if you have nodemon installed, `nodemon app.js`. You should see a log stating the server is running.

/images/posts/my-first-week-at-auth0/cover.jpg
![](/images/posts/the-easiest-way-to-add-node-js-user-authentication/1.png)

## [](#setup-environment-variables)Setup Environment Variables

We are going to need 4 different environment variables to configure the express-openid-connect libary.

1.  ISSUER_BASE_URL - the base url of the issuer (from the authorization server)
2.  CLIENT_ID = unique id for the client (from the authorization server)
3.  BASE_URL- the url of the locally running server (`http://localhost:3000` in this case)
4.  SECRET - a random string of at least 32 characters

Since we are running this app locally, we are going to store these environment variables inside of a `.env` file. Create that file in the root of your repository and paste in the following.

```
ISSUER_BASE_URL=
CLIENT_ID=
BASE_URL=
SECRET=
```

### [](#auth0-or-alternative-setup)Auth0 (Or Alternative) Setup

In this demo, we are going to use [Auth0](http://auth0.com/), a 3rd party authentication provider, to do the majority of the behind-the-scenes authentication work. **It's important to note that you could use any other 3rd party authentication provider that is OpenID Connect compliant.** That means you could easily swap out to a different provider by changing your environment variables.

If you are going to use Auth0, you'll need to [sign up for a FREE account](http://auth0.com/signup) if you don't have one already. As part of the process, you will create a tenant, which is basically a container for different applications.

Next, you'll need to create an application and choose `Regular Web App`.

![](/images/posts/the-easiest-way-to-add-node-js-user-authentication/2.png)

With your application created, you'll need to update two settings, the callback URL and logout URL. We will be leveraging the OpenID Connect protocol for handling authentication which requires the user to be redirected to the authorization and then back to our application. Because of this, we need to tell Auth0 where the user should be redirected back to.

> Don't worry, all of the redirect business gets handled by the authorization server. You don't have to write any of that logic.

- Callback URL - [http://localhost:3000/callback](http://localhost:3000/callback)
- Logout URL - [http://localhost:3000](http://localhost:3000)

![](/images/posts/the-easiest-way-to-add-node-js-user-authentication/3.png)

Be sure to scroll down and hit save.

Lastly, we need to grab two properties from our Auth0 application, the Domain and the Client ID.

![](/images/posts/the-easiest-way-to-add-node-js-user-authentication/4.png)

### [](#update-environment-variables-appropriately)Update Environment Variables Appropriately

Remember, you don't have to use Auth0 to make this work, so if you used another provider, just use those credentials. Now, update the `.env` file with the appropriate values.

```
ISSUER_BASE_URL=https://<YOUR_DOMAIN>
CLIENT_ID=<YOUR_CLIENT_ID>
BASE_URL=http://localhost:3000
SECRET=<LONG_RANDOM_STRING>
```

Lastly, for our environment variables to be accessible while running locally, you need to require the `dotenv` package and call its `config()` function like so. Make sure to put this at the top of your file.

```
require('dotenv').config();
```

## [](#express-open-id-package-configuration)Express Open ID Package Configuration

With all of that setup, let's get down to the auth. We need to `auth` from the express-openid-connection package.

Then, we configure the auth object using the credentials from our environment variables. Lastly, we use this object as middleware in our Express server. Here's what that looks like.

```
const { auth } = require('express-openid-connect');
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
);
```

With this middleware in place, we can get access to the logged-in user (if they are logged in) inside of the request parameter of a given endpoint. For example, if we wanted to show whether the user is logged in or not, we could define an index route like so.

```
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});
```

Restart your server and then open your browser to `localhost:3000`. and you should see "Logged out".

Now, for the magic. Notice, we didn't define any login or logout routes specifically. Well, those are already created for us! Now, you can navigate to `localhost:3000/login` and follow the login process. After you finish, the home page should now show logged in 🥳

How cool is that?!?!

## [](#creating-a-profile-route)Creating a Profile Route

Now that you can track a logged-in user, we can create a profile route that will show info about the user. This grabs the information about the logged-in user and returns it as json.

```
app.get('/profile', (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
```

Restart your server and make sure you are logged in. Then, navigate to `localhost:3000/profile`.

![](/images/posts/the-easiest-way-to-add-node-js-user-authentication/5.png)

## [](#protecting-routes)Protecting Routes

With the profile route, you don't want someone who isn't logged in to be able to access it. Therefore, we need to add some protection to the route to make sure that doesn't happen. Thankfully, the library we are using will help us do just that.

Start by importing the `requiresAuth` middleware from the library.

```
const { auth, requiresAuth } = require('express-openid-connect');
```

Then, use this middleware in the profile route like so.

```
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
```

Restart your server and logout by going to `localhost:3000/logout`. Then try to navigate to the `/profile` route. You should be redirected to the login page!

## [](#wrap-up)Wrap Up

This library did a lot of work for us. Behind the scenes, it created fully functions login and logout routes. It also tracks the user and exposes user info on the `req` object of each API request. It also provided middleware to be able to easily protect our API routes by forcing a user to login!

Here's the full source code, LESS THAN 30 LINES!

```
const express = require('express');
const app = express();
require('dotenv').config();
const { auth, requiresAuth } = require('express-openid-connect');
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
);
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
```

I've tried several different approaches to handle authentication in Node.js and this is by far the easiest one I've found.
