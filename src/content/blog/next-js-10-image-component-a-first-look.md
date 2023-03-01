---
title: Next.js 10 Image Component - A First Look
slug: next-js-10-image-component-a-first-look
coverImage: /images/posts/next-js-10-image-component-a-first-look/cover.jpg
pubDate: 2020-12-16
description: Let's take a first look at the Next.js 10 Image Component.
youTubeVideoId: PsDz3kpp354
tags: nextjs
---

Images can make or break performance on your site. With Next.js 10 and its new [Image component](https://nextjs.org/docs/api-reference/next/image), optimizing image performance in your sites just got a lot easier. This is a sought-after feature from developers, so let's take a look.

## Starter Code

Start by creating a new Next.js project with `create-next-app`.

```
npx create-next-app image-demo
```

Now, replace the content inside of the `index.js` file with the following code that displays three images.

```
import Head from 'next/head';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <div>
                    <img src="/nyc.jpg" alt="NYC" height={853} width={1280} />
                    <img src="/nyc2.jpg" alt="NYC" height={1080} width={1920} />
                    <img src="/nyc3.jpg" alt="NYC" height={1276} width={1920} />
                </div>
            </main>
        </div>
    );
}

```

You'll need to add images to your project inside of the public directory. I grabbed 3 random pictures of New York from [Pixabay](https://pixabay.com/).

With images in place, run your project with `npm run dev` and open your browser to `localhost:3000`. Then, open the network tab in your developer tools (filter by Img requests) and reload the page.

![](/images/posts/next-js-10-image-component-a-first-look/1.jpeg)

## Performance Improvements

Notice a few things in your network tab.

- each image is loaded regardless of it being visible to the user
- images sizes are large

These two things are extremely hurtful for performance. First off, there's no point in loading images that a user will never see.

Additionally, look at the image sizes.

- 447 kb
- 795 kb
- 567 kb

Those sizes are large and unnecessary. When we do load an image, we should load the appropriate sizes of an image. For example, if the user is loading the site on their phone, there's no point in loading an extremely large image.

## Next.js Image Component

The new Image component in Next.js fixes all of this for us. All we need to do is import it, and use it in place of the default `img` tag. Replace the code in your `index.js` file with the following.

```
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <div>
                    <Image src="/nyc.jpg" alt="NYC" height={853} width={1280} />
                    <Image
                        src="/nyc2.jpg"
                        alt="NYC"
                        height={1080}
                        width={1920}
                    />
                    <Image
                        src="/nyc3.jpg"
                        alt="NYC"
                        height={1276}
                        width={1920}
                    />
                </div>
            </main>
        </div>
    );
}

```

### Lazy Loading

Refresh your page and now look at the network tab again.

![](/images/posts/next-js-10-image-component-a-first-look/2.jpeg)

Notice first that only 2 of the images are being requested. Since I couldn't see the third one on the visible screen, it didn't get loaded. However, if I scroll down a bit, you'll see the new request come through.

![](/images/posts/next-js-10-image-component-a-first-look/3.gif)

How cool is that? The Image component is smart enough to only request the image if it's going to be visible to the user!

### Optimal Image Sizes

Remember how big the original images were without the Image component. Well, now they are much smaller.

- 447 kb -> 291 kb
- 795 kb -> 225 kb
- 567 kb -> 136 kb

This is because Next.js will create multiple versions of these images that are optimal for different screen sizes. If I make my screen even smaller, you'll see the image sizes get smaller as well.

![](/images/posts/next-js-10-image-component-a-first-look/4.png)

## Wrap Up

Just like that, your site is much more performant. By using the Next.js Image component, you're able to take advantage of lazy loading as well as optimizations around image sizes. If you've tried it out, let me know what you think!
