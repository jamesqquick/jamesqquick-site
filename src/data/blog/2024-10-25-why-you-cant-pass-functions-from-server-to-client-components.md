---
title: Why You Can't Pass Functions From Server to Client Components
pubDate: 2024-10-25T15:49:21.902Z
slug: why-you-cant-pass-functions-from-server-to-client-components
coverImage: ./images/postman-vs-code-extension/cover.jpg
fmContentType: blog
description: JavaScript functions can't be serialized so they can't be passed from a Server Component to a Client Component in React.
tags:
  - nextjs
  - react
---

Up until the last couple of years in React, the typical way to interact with a back-end is by making a `fetch` request to an API endpoint. There are a few downsides to this:

- having to create an entire API route
- having to maintain state on the client
- lack of TypeScript safety

With the creation of [Server Actions](https://react.dev/reference/rsc/server-actions) in React, we no longer have to do this. Instead, you can pass a Server Action to a Client Component (or import it directly), and maigcally, you're able to call a function on the server from the client.

```tsx
"use client";

interface Props {
  action: () => void;
}

export default function ClientButton({ action }: Props) {
  return <button onClick={action}>From client</button>;
}
```

There's a lot of magic that makes this possible. This is something I can dig into in another post.

If you're anything like me, though, you have wondered why you couldn't just pass a regular function as a prop to your Client Copmonent. Well, if you try it, you'll get an error similar to this.

```
 Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

Why is that? Well, it's because JavaScript functions aren't serializable. What does this mean?

JavaScript functions depend on the context that they're defined in, in other words a closure. For example, say you have a function that calls another function or accesses a variable not defined within the function itself? What would happen? Take this example.

```javascript
const age = 1;

const incrementAge = () => {
  age++;
};
```

If I wanted to pass the function `incrementAge` to the client, how would the client know about the `age` variable? The answer is, it wouldn't and this code would fail. Because the client won't have any context for the original scope on the server, there's no way to safely pass functions from the server to the client.

You may also start to wonder, what about passing [pure functions](https://www.geeksforgeeks.org/pure-functions-in-javascript/), ones that don't mutate or "reach outside of themselves". That's a good idea, but the reality is, functions don't inherently require that. It's just a paradigm you **can** follow.

All in all, there's no way to guarantee that a function passed from the server to the client would be able to run successfuly. Therefore, functions cannot be passed from Server to Client components because they are not serializable.

## Wrap Up

I think Server Actions are incredible and allow a much more concise and explicit method for handling client to server interactions. I'll be writing more about the latest features in React and Next.js, so if you have any questions or topics you'd like to see covered, let me know on [Twitter](https://twitter.com/jamesqquick).
