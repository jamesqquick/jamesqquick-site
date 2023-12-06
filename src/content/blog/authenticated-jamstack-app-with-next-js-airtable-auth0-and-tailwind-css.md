---
title: Build an Authenticated JAMstack App with Next.js, Airtable, Auth0, and Tailwind CSS
slug: authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css
coverImage: ./images/authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css/cover.png
pubDate: 2020-10-05
description: Learn to incorporate authentication and real data into a Next.js app!
youTubeVideoId: TNKzKtNTjls
tags:
  - nextjs
---

Next.js makes building Full-stack applications in the JAMstack much easier, but there's still a few pieces to figure out. Where are you going to store data? How are you handling authentication? Well, here's how we are going to put it all together.

- [Next.js](https://nextjs.org/) for front-end and API routes w/ Serverless Functions
- [Airtable](https://airtable.com/) for storing data
- [Auth0](https://a0.to/auth0) for Authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling

> In this article, we'll cover an abridged version of this tutorial. Be sure to watch the entire [YouTube playlist](https://www.youtube.com/playlist?list=PLZ14qQz3cfJJOcbbVi_nVEPqC2334LLMz) for a more detailed walkthrough.

### [](#tldr)TLDR

- Setup Next.js project and an Airtable base
- Configure Next.js with Tailwind CSS
- Integrate Airtable with API routes/serverless functions
- Create React Context for tracking TODOs and CRUD operations
- Configure authentication with Auth0
- Add authentication and authorization to API endpoints

### [](#project-setup)Project Setup

To get started, you'll want to create a starter next application by running the following command.

```
npx create-next-app [app-name]
```

Open this code in your text editor.

## [](#configuring-tailwind-css-with-nextjs)Configuring Tailwind CSS with Next.js

We are going to use Tailwind CSS for styling our application. Tailwind is a utility-based framework, so we won't write any CSS from scratch. We'll leverage the Tailwind classes for all of our styling.

First, install Tailwind CSS and PostCSS.

```
npm install --save-dev tailwindcss postcss-preset-env
```

Next, let's configure Tailwind.

```
npx tailwind init
```

Then, create a postcss.config.js file in the root of your project for your PostCSS configuration. Add the following snippet of code.

```
module.exports = {
  plugins: ['tailwindcss', 'postcss-preset-env'],
}
```

Now that Tailwind and PostCSS are configured, we'll need to use it. Add an index.css into your `styles` directory and add the following.

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import that new css file into your `_app.js` file. I also added some styles to wrap our application with a container.

```
import '../styles/index.css';
function MyApp({ Component, pageProps }) {
    return (
      <div className="container mx-auto my-10 max-w-xl">
          <Component {...pageProps} />
      </div>
    );
}

export default MyApp;
```

Lastly, let's clean up the `index.js` file to remove the previous styling and boilerplate JSX. I deleted everything except for the `head` and `main` tags and added an `h1`.

```
import Head from 'next/head';
export default function Home() {

    return (
        <div>
            <Head>
                <title>Authenticated TODO App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
              <h1 className="text-2xl text-center mb-4">My Todos</h1>
            </main>
        </div>
    );
}
```

## [](#create-a-tailwind-navbar)Create a Tailwind Navbar

Let's create a basic Navbar for our app. It will have a title on the left and login/logout buttons on the right.

```
import React from 'react';

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center py-4">
            <p className="text-2xl font-bold text-grey-800">My Todos</p>
            <div className="flex">
                <a
                    href="/api/logout"
                    className=" rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                >
                    Logout
                </a>
                <a
                    href="/api/login"
                    className="rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                >
                    Login
                </a>
            </div>
        </nav>
    );
}
```

Then, import it into your Home page.

```
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function Home() {

    return (
        <div>
            <Head>
                <title>Authenticated TODO App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar/>
            </main>
        </div>
    );
}
```

## [](#airtable-setup-and-nextjs-environment-variables)Airtable Setup and Next.js Environment Variables

You'll need to set up a free account on Airtable. After you've done that, you can create your base (Airtable code word for database). Choose `from scratch` and give it a name. After it's created, double-click to open it up and update the columns.

- description - single-line text
- completed - checkbox
- userId - single-line text

Rename your table to `todo`, and add some dummy data. Should look like this in the end.

Next, you'll need to find your Table ID as well as your API key. To do so, visit the [Airtable API](https://airtable.com/api) page and click on your Base. On the documentation page, you'll see the ID of the base and you can find your API by checking the "show API key" box in the top right.

To work with Airtable in Next.js, we are going to use the Airtable JavaScript SDK.

```
npm install airtable
```

To configure the Airtable client we will need the base id, API secret, and table name. We'll access these credentials through environment variables.

Environment variables are typically stored in your hosting provider. For example, I often use Netlify to host my sites and can store environment variables there. However, how do you access environment variables when running locally? With Next.js (and many other frameworks), you have the ability to load environment variables from a local `.env` file. That's what we'll do here.

Create a `.env` in the root of your project and fill in the Airtable credentials below. We'll get to the Auth0 credentials in a bit.

```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=
AUTH0_DOMAIN=
AUTH0_SECRET=
AUTH0_CLIENT_ID=
COOKIE_SECRET=
```

## [](#integrate-airtable-with-nextjs-serverless-functions)Integrate Airtable with Next.js Serverless Functions

For re-using Airtable logic, create a `utils` directory inside of the `api` directory and add an `Airtable.js` file. In the Airtable.js file, we'll configure the Airtable client as well as include a few helper files for minifying the data that comes back from the Airtable API.

```
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
);

const table = base(process.env.AIRTABLE_TABLE_NAME);

const minifyRecords = (records) => {
    return records.map((record) => getMinifiedRecord(record));
};
const getMinifiedRecord = (record) => {
    if (!record.fields.completed) {
        record.fields.completed = false;
    }
    return {
        id: record.id,
        fields: record.fields,
    };
};

export { table, getMinifiedRecord, minifyRecords };
```

Now, you'll need CRUD endpoints to interact with Airtable. Create the following files.

`pages/api/getTodos.js`

```
import { table, minifyRecords } from './utils/Airtable';

export default async (req, res) => {
    try {
        const records = await table.select({}).firstPage();
        const minifiedRecords = minifyRecords(records);
        res.statusCode = 200;
        res.json(minifiedRecords);
    } catch (err) {
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
};
```

`pages/api/createTodo.js`

```
import { table, minifyRecords } from './utils/Airtable';

export default async (req, res) => {
    const { description } = req.body;
    try {
        const createdRecords = await table.create([
            { fields: { description} },
        ]);
        const createdRecord = {
            id: createdRecords[0].id,
            fields: createdRecords[0].fields,
        };
        res.statusCode = 200;
        res.json(createdRecord);
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
};
```

`pages/api/updateTodo.js`

```
import { table, getMinifiedRecord } from './utils/Airtable';
export default async (req, res) => {
    const { id, fields } = req.body;
    try {
        const updatedRecords = await table.update([{ id, fields }]);
        res.statusCode = 200;
        res.json(getMinifiedRecord(updatedRecords[0]));
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
};
```

`pages/api/deleteTodo.js`

```
import { table, getMinifiedRecord } from './utils/Airtable';

export default async (req, res) => {
    const { id } = req.body;

    try {
        const deletedRecords = await table.destroy([id]);
        res.statusCode = 200;
        res.json(getMinifiedRecord(deletedRecords[0]));
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
};
```

## [](#display-todos)Display TODOs

With those CRUD API routes in place, we can use the `getServerSideProps` hook in our home page, to load the list of TODOs and pass them into the Home component.

```
import Head from 'next/head';
import { table, minifyRecords } from './api/utils/airtable';
import Todo from '../compenents/Todo';
import Navbar from '../components/Navbar';

export default function Home({ initialTodos }) {
    return (
        <div className="max-w-xl m-auto p-2">
            <Head>
                <title>My Todo CRUD App</title>
            </Head>

            <main>
                <Navbar />
                <>
                    <ul>
                        {initialTodos &&
                            initialTodos.map((todo) => (
                                <Todo todo={todo} key={todo.id} />
                            ))}
                    </ul>
                </>
            </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    let todos = await table
        .select({ })
        .firstPage();
    return {
        props: {
            initialTodos: minifyRecords(todos),
        },
    };
}
```

After the Home component receives the `initialTodos` in props, it uses `Todo` components for displaying the todos. Create a `components` directory inside the root of the project and add a `Todo.js` file.

```
export default function Todo({ todo }) {

    return (
        <li className="bg-white flex items-center shadow-lg rounded-lg my-2 py-2 px-4">
            <input
                type="checkbox"
                name="completed"
                id="completed"
                checked={todo.fields.completed}
                className="mr-2 form-checkbox h-5 w-5"
                onChange={()=>{}}
            />
            <p
                className={`flex-1 text-gray-800 ${
                    todo.fields.completed ? 'line-through' : ''
                }`}
            >
                {todo.fields.description}
            </p>
            <button
                type="button"
                className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded "
                onClick={() => {}}
            >
                Delete
            </button>
        </li>
    );
}
```

## [](#creating-a-todo-context)Creating a TODO Context

We'll use React Context to share the state of our TODOs between components. This context will expose the list of TODOs as well as the necessary functions for performing CRUD operations by calling our API endpoints.

> It's important to mention that in a scaled production application, the Context API might not be the best fit. If your data is frequently changing, this will cause lots of re-renders in your app.

```
import { createContext, useState } from 'react';

const TodosContext = createContext();

const TodosProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);

    const refreshTodos = async () => {
        try {
            const res = await fetch('/api/getTodos');
            const latestTodos = await res.json();
            setTodos(latestTodos);
        } catch (err) {
            console.error(err);
        }
    };

    const addTodo = async (description) => {
        try {
            const res = await fetch('/api/createTodo', {
                method: 'POST',
                body: JSON.stringify({ description }),
                headers: { 'Content-Type': 'application/json' },
            });
            const newTodo = await res.json();
            setTodos((prevTodos) => {
                return [newTodo, ...prevTodos];
            });
        } catch (err) {
            console.error(err);
        }
    };

    const updateTodo = async (updatedTodo) => {
        try {
            const res = await fetch('/api/updateTodo', {
                method: 'PUT',
                body: JSON.stringify(updatedTodo),
                headers: { 'Content-Type': 'application/json' },
            });
            await res.json();
            setTodos((prevTodos) => {
                const existingTodos = [...prevTodos];
                const existingTodo = existingTodos.find(
                    (todo) => todo.id === updatedTodo.id
                );
                existingTodo.fields = updatedTodo.fields;
                return existingTodos;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await fetch('/api/deleteTodo', {
                method: 'Delete',
                body: JSON.stringify({ id }),
                headers: { 'Content-Type': 'application/json' },
            });

            setTodos((prevTodos) => {
                return prevTodos.filter((todo) => todo.id !== id);
            });
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <TodosContext.Provider
            value={{
                todos,
                setTodos,
                refreshTodos,
                updateTodo,
                deleteTodo,
                addTodo,
            }}
        >
            {children}
        </TodosContext.Provider>
    );
};

export { TodosProvider, TodosContext };
```

For this context to be available in our application, we need to wrap the content in the `_app.js` with the `TodosProvider`.

```
import '../styles/index.css';
import { TodosProvider } from '../contexts/TodosContext';
function MyApp({ Component, pageProps }) {
    return (
        <TodosProvider>
            <div className="container mx-auto my-10 max-w-xl">
                <Component {...pageProps} />
            </div>
        </TodosProvider>
    );
}

export default MyApp;
```

From there, we will set the TODOs in the context with the `initialTodos`from the props of the Home component. After setting the TODOs in the context, we'll use the todos from the context to display.

This might seem a bit confusing but it allows us to load our TODOs on the server initially and then track them using React Context.

```
export default function Home({ initialTodos }) {
    const { todos, setTodos } = useContext(TodosContext);
    useEffect(() => {
        setTodos(initialTodos);
    }, []);

    render(
      ...
          <ul>
              {todos &&
                  todos.map((todo) => (
                      <Todo key={todo.id} todo={todo} />
                  ))}
          </ul>
      ...
    )
}
```

Now, we can update the `todo` component to add the hooks for updating and deleting items.

```
import React, { useContext } from 'react';
import { TodosContext } from '../contexts/TodosContext';
export default function Todo({ todo }) {
    const { updateTodo, deleteTodo } = useContext(TodosContext);

    const handleToggleCompleted = () => {
        const updatedFields = {
            ...todo.fields,
            completed: !todo.fields.completed,
        };
        const updatedTodo = { id: todo.id, fields: updatedFields };
        updateTodo(updatedTodo);
    };
    return (
        <li className="bg-white flex items-center shadow-lg rounded-lg my-2 py-2 px-4">
            <input
                type="checkbox"
                name="completed"
                id="completed"
                checked={todo.fields.completed}
                className="mr-2 form-checkbox h-5 w-5"
                onChange={handleToggleCompleted}
            />
            <p
                className={`flex-1 text-gray-800 ${
                    todo.fields.completed ? 'line-through' : ''
                }`}
            >
                {todo.fields.description}
            </p>
            <button
                type="button"
                className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded "
                onClick={() => deleteTodo(todo.id)}
            >
                Delete
            </button>
        </li>
    );
}
```

## [](#setup-authentication-with-auth0)Setup Authentication with Auth0

For integrating Auth0 into our Next.js app, we'll use the [nextjs-auth0 package](https://github.com/auth0/nextjs-auth0). Start by installing the package.

```
npm install @auth0/nextjs-auth0
```

> To complete this series, you'll need to sign up for a [free account at Auth0](https://a0.to/auth0).

Inside of Auth0, you'll need to create a new application and choose Regular Web Application. You'll also need to update two settings. These are callback URLs to routes that we will create in a second.

- **Allowed Callback URLs** : [http://localhost:3000/api/callback](http://localhost:3000/api/callback)​
- **Allowed Logout URLs** : [http://localhost:3000](http://localhost:3000/)​

In the dashboard, copy the Auth0 domain, client id, and secret for your application. Add these credentials to the .env file in your repository. You'll also need to fill in the `COOKIE_SECRET` property with a random string of at least 32 characters.

Next, we'll create the Auth0 client configuration. Create an `auth0.js` file in your `utils` directory with the following.

```
import { initAuth0 } from '@auth0/nextjs-auth0';

export default initAuth0({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET,
    scope: 'openid profile',
    redirectUri: 'http://localhost:3000/api/callback',
    postLogoutRedirectUri: 'http://localhost:3000/',
    session: {
        // The secret used to encrypt the cookie.
        cookieSecret: process.env.COOKIE_SECRET,
    },
});
```

### [](#login-route)Login Route

Create a `login.js` file inside of the `api` directory.

```
import auth0 from './utils/auth0';

export default async function login(req, res) {
    try {
        await auth0.handleLogin(req, res);
    } catch (error) {
        console.error(error);
        res.status(error.status || 400).end(error.message);
    }
}
```

### [](#callback-route)Callback Route

Create a `callback.js` file inside of the `api` directory.

```
import auth0 from './utils/auth0';

export default async function callback(req, res) {
    try {
        await auth0.handleCallback(req, res, { redirectTo: '/' });
    } catch (error) {
        console.error(error);
        res.status(error.status || 400).end(error.message);
    }
}
```

### [](#logout-route)Logout Route

Create a `logout.js` file inside of the `api` directory.

```
import auth0 from './utils/auth0';

export default async function logout(req, res) {
    try {
        await auth0.handleLogout(req, res);
    } catch (error) {
        console.error(error);
        res.status(error.status || 400).end(error.message);
    }
}
```

### [](#%E2%80%8B-testing-authentication)​ Testing Authentication

Since our Navbar already has buttons for logging in and logging out, you can test the authentication process out. After you finish the logging in, however, you won't notice anything different. That's because we aren't ​using the fact that the user is logged in to display anything different on the front end. Let's change that.

In the `index.js`, we'll update the `getServerSideProps` hook to pass the user into props if they are logged in. We grab the user (if logged in) from the Auth0 session.

```
export async function getServerSideProps(context) {
    const session = await auth0.getSession(context.req);
    let todos = await table.select().firstPage();
    return {
        props: {
            initialTodos: minifyRecords(todos),
            user: session?.user || null,
        },
    };
}
```

Then, we can grab the user out of the component properties and pass it to the Navbar component.

```
import Head from 'next/head';
import { table, minifyRecords } from './api/utils/airtable';
import Todo from '../compenents/Todo';
import { useEffect, useContext } from 'react';
import { TodosContext } from '../contexts/TodosContext';
import auth0 from './api/utils/auth0';
import Navbar from '../components/Navbar';

export default function Home({ initialTodos, user }) {
    const { todos, setTodos } = useContext(TodosContext);
    useEffect(() => {
        setTodos(initialTodos);
    }, []);

    return (
        <div className="max-w-xl m-auto p-2">
            <Head>
                <title>My Todo CRUD App</title>
            </Head>

            <main>
                <Navbar user={user} />
               ...
            </main>
        </div>
    );
}
```

We can then update the Navbar to display the login button when the user is logged out and the logout button when the user is logged in.

```
import React from 'react';

export default function Navbar({ user }) {
    return (
        <nav className="flex justify-between items-center py-4">
            <p className="text-2xl font-bold text-grey-800">My Todos</p>
            <div className="flex">
                {user && (
                    <a
                        href="/api/logout"
                        className=" rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                    >
                        Logout
                    </a>
                )}
                {!user && (
                    <a
                        href="/api/login"
                        className="rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
                    >
                        Login
                    </a>
                )}
            </div>
        </nav>
    );
}
```

Now, if you log in, you should see the logout button showing and visa versa after logging out.

## [](#create-the-todo-form-with-tailwind)Create the TODO Form with Tailwind

Create a `TodoForm.js` file in your `components` directory. I won't cover the details of tailwind here, but you can watch the video for more background. We'll use state here to keep track of the user's input for the description of their todo item.

That said, add the following form to your new component.

```
import React, { useState } from 'react';

export default function TodoForm() {
    const [todo, setTodo] = useState('');

    return (
        <form className="form my-6">
            <div className="flex flex-col text-sm mb-2">
                <label className="font-bold mb-2 text-gray-800" htmlFor="todo">
                    Todo
                </label>
                <input
                    type="text"
                    name="todo"
                    id="todo"
                    value={todo}
                    onChange={(e) => setTodo(e.target.value)}
                    placeholder="ex. Learn about authentication"
                    className="border border-gray-200 p-2 rounded-lg appearance-none focus:outline-none focus:border-gray-500"
                />
            </div>
            <button
                type="submit"
                className="w-full rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
            >
                Submit
            </button>
        </form>
    );
}
```

With that in place, we can now leverage our context provider from above. Remember, that provider exposes an `addTodo` function that we can leverage here. We'll add a `handleSubmit` function that will prevent the default form submission action and call the `addTodo` function.

```
import React, { useState, useContext } from 'react';
import { TodosContext } from '../contexts/TodosContext';

export default function TodoForm() {
    const [todo, setTodo] = useState('');
    const { addTodo } = useContext(TodosContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        addTodo(todo);
        setTodo('');
    };
    return (
        <form className="form my-6" onSubmit={handleSubmit}>
            <div className="flex flex-col text-sm mb-2">
                <label className="font-bold mb-2 text-gray-800" htmlFor="todo">
                    Todo
                </label>
                <input
                    type="text"
                    name="todo"
                    id="todo"
                    value={todo}
                    onChange={(e) => setTodo(e.target.value)}
                    placeholder="ex. Learn about authentication"
                    className="border border-gray-200 p-2 rounded-lg appearance-none focus:outline-none focus:border-gray-500"
                />
            </div>
            <button
                type="submit"
                className="w-full rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
            >
                Submit
            </button>
        </form>
    );
}
```

Include the new form component in the home page and test it out. I also added a bit of logic to only display the form if the user is logged in. Hopefully, you'll see your new todo item was submitted successfully!

```
import Head from 'next/head';
import { table, minifyRecords } from './api/utils/airtable';
import Todo from '../compenents/Todo';
import { useEffect, useContext } from 'react';
import { TodosContext } from '../contexts/TodosContext';
import TodoForm from '../compenents/TodoForm';
import auth0 from './api/utils/auth0';
import Navbar from '../components/Navbar';

export default function Home({ initialTodos, user }) {
    const { todos, setTodos } = useContext(TodosContext);
    useEffect(() => {
        setTodos(initialTodos);
    }, []);

    return (
        <div className="max-w-xl m-auto p-2">
            <Head>
                <title>My Todo CRUD App</title>
            </Head>

            <main>
                <Navbar user={user} />
                {user ? (
                    <>
                        <TodoForm />
                        <ul>
                            {todos &&
                                todos.map((todo) => (
                                    <Todo todo={todo} key={todo.id} />
                                ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-center mt-4">
                        Please login to save todos!
                    </p>
                )}
            </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await auth0.getSession(context.req);
    let todos = await table.select().firstPage();
    return {
        props: {
            initialTodos: minifyRecords(todos),
            user: session?.user || null,
        },
    };
}
```

## [](#add-authentication-to-api-routes)Add Authentication to API Routes

With the functionality for adding TODOs in place, we need to associate new records with the logged-in user and verify that a user is logged in before letting them perform CRUD operations. We'll do this by grabbing the user from the Auth0 session similar to how we did in the `getServerSideProps` hook for the home page.

We then use the `sub` property of the user and add it as the `userId` property of the new TODO record in the `createTodo.js` file.

```
import { table, minifyRecords } from './utils/Airtable';
import auth0 from './utils/auth0';

export default async (req, res) => {
    const { description } = req.body;
    const { user } = await auth0.getSession(req);
    try {
        const createdRecords = await table.create([
            { fields: { description, userId: user.sub } },
        ]);
        const createdRecord = {
            id: createdRecords[0].id,
            fields: createdRecords[0].fields,
        };
        res.statusCode = 200;
        res.json(createdRecord);
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
};
```

This associates new records with the user, but it doesn't prevent someone who is not logged in from calling this endpoint. Thankfully, the Auth0 library gives us an easy way to protect an endpoint from non logged in users. We accomplish this by wrapping our async function with `auth0.requireAuthentication()`.

```
import { table, minifyRecords } from './utils/Airtable';
import auth0 from './utils/auth0';

export default auth0.requireAuthentication(async (req, res) => {
    const { description } = req.body;
    const { user } = await auth0.getSession(req);
    ...
});
```

**Note: You should update each of the other CRUD API routes with this protection as well.**

Now that a user is being associated with TODO records, let's only show the user the records that they created and not other people's records. We can do this by updating the Airtable query in the home component's `getServerSideProps` hook.

```
export async function getServerSideProps(context) {
    const session = await auth0.getSession(context.req);
    let todos = [];
    if (session?.user) {
        todos = await table
            .select({ filterByFormula: `userId = '${session.user.sub}'` })
            .firstPage();
    }
    return {
        props: {
            initialTodos: minifyRecords(todos),
            user: session?.user || null,
        },
    };
}
```

## [](#protect-api-routes-with-authorization)Protect API Routes with Authorization

One last bit of security we need to add is to make sure that only the owner of a given record is able to update or delete that record. In other words, users shouldn't be able to update or delete records that they did not create. For this, we'll create a custom piece of middleware. Create a `middleware` directory inside of your `api` directory. and add an `OwnsRecords.js` file.

Inside this file, we will start by getting the logged-in user. We can use the same `auth0.requireAuthentication()` function from above to verify the user is logged in.

```
import auth0 from '../utils/auth0';
import { table } from '../utils/Airtable';

const ownsRecord = (handler) =>
    auth0.requireAuthentication(async (req, res) => {
      const { user } = await auth0.getSession(req);
});

export default ownsRecord;
```

This middleware will be used on the update and delete routes. Since both of them require an id property to be included in the body, we can use that id to grab the existing record from the database. Then, we compare the `userId` property of the existing record to the `sub` property of the logged-in user to ensure the user owns the record. Lastly, we attach the existing record to the request so that it can be used if necessary in the API route itself.

```
import auth0 from '../utils/auth0';
import { table } from '../utils/Airtable';

const ownsRecord = (handler) =>
    auth0.requireAuthentication(async (req, res) => {
        const { user } = await auth0.getSession(req);

        const { id } = req.body;

        try {
            const existingRecord = await table.find(id);

            if (!existingRecord || user.sub !== existingRecord.fields.userId) {
                res.statusCode = 404;
                return res.json({ msg: 'Record not found' });
            }

            req.record = existingRecord;
            return handler(req, res);
        } catch (error) {
            console.error(err);
            res.statusCode = 500;
            return res.json({ msg: 'Something went wrong' });
        }
    });

export default ownsRecord;
```

With the middleware created, now we can wrap our update and delete functions with it.

**updateTodo.js**

```
import { table, getMinifiedRecord } from './utils/Airtable';
import auth0 from './utils/auth0';
import OwnsRecord from './middleware/OwnsRecord';
export default OwnsRecord(async (req, res) => {
    const { id, fields } = req.body;
    const { user } = await auth0.getSession(req);

    try {
        const updatedRecords = await table.update([{ id, fields }]);
        res.statusCode = 200;
        res.json(getMinifiedRecord(updatedRecords[0]));
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
});
```

**deleteTodo.js**

```
import { table, getMinifiedRecord } from './utils/Airtable';
import auth0 from './utils/auth0';
import OwnsRecord from './middleware/OwnsRecord';

export default OwnsRecord(async (req, res) => {
    const { id } = req.body;
    const { user } = await auth0.getSession(req);

    try {
        const deletedRecords = await table.destroy([id]);
        res.statusCode = 200;
        res.json(getMinifiedRecord(deletedRecords[0]));
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.json({ msg: 'Something went wrong' });
    }
});
```

# [](#wrap-up)Wrap Up
