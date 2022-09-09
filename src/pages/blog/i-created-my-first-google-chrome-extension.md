---
layout: "../../layouts/BlogPostLayout.astro"
title: I Created My First Google Chrome Extension
slug: i-created-my-first-google-chrome-extension
coverImage: /images/posts/i-created-my-first-google-chrome-extension/cover.png
pubDate: 2020-08-11
description: As a developer, it's nice to be able to create things to make your life easier. I was tired of having to open up my videos just to copy the link and share it. So, I created my first Chrome Extension! It shows me a list of my most recent videos and allows me to copy the link directly!
youTubeVideoId: 3Xq_QfYdmMQ
---

As a developer, it's nice to be able to create things to make your life easier. I was tired of having to open up my previous YouTube videos just to copy the link and share it. So, I created my first Chrome Extension! It shows me a list of my most recent videos and allows me to copy the link directly.

> As a Developer you have the power to build whatever you want!

Here's how I did it.

## Project Setup

The first thing I did was create a `manifest.json` file where you can store the metadata for your app. There's a couple of key properties.

- manifest-version - Google says this should be 2 currently
- name and description - hopefully self-explanatory
- version - the version of your extension
- browser action - this is where we will specify our icon as well as what HTML to show when a user clicks on the extension
- permissions - array of permissions required (I didn't need any specifically)

Here's what my manifest file looks like.

    {
        "manifest_version": 2,
        "name": "JQQ YouTube Links",
        "description": "Shows recent YT video links from JQQ",
        "version": "1.0",
        "browser_action": {
            "default_icon": "icon.png",
            "default_popup": "popup.html"
        },
        "permissions": []
    }

Notice that I specified `popup.html` as my default popup. This means that HTML will be what get's displayed when the user clicks the extension. Since I needed JS and CSS, I added three new files.

- popup.html
- popup.js
- popup.css

Here's my full HTML file.

    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>JQQ YouTube Links</title>
            <link rel="stylesheet" href="popup.css" />
        </head>
        <body>
            <div class="container">
                <h2>JQQ YouTube Links</h2>
                <ol id="linksList"></ol>
            </div>
            <script src="popup.js"></script>
        </body>
    </html>

Notice I linked to the JS and CSS files and included an ordered list element that I will populate in JavaScript.

## How To Test

You can test this in two ways. One is to open the HTML page in the browser just like any other app. I would suggest using the Live Server extension in VS Code to help with that.

The second way to test is to create the Chrome extension by connecting it to the directory your code is inside. For this, you'll need to open `chrome://extensions` and turn on developer mode. There should be a toggle for it.

Then, choose `Load Unpacked` and connect it to your code folder. After you do, you'll see your extension listed.

![](/images/posts/i-created-my-first-google-chrome-extension/1.png)

After that, you should see the extension in your extension bar, and when you click it, you'll the base HTML being displayed.

## Displaying Links

One tricky thing I had to figure out was how to get the list of recent YouTube video links. I opted to create a serverless function (completely seperate from this) for this instead of trying to work with the Google APIs directly in the extension. It just ended up being easier this way. It's hosted on Netlify and you can check out the [source code](https://github.com/jamesqquick/jqq-util-functions/blob/master/functions/recentYTVideos.js) if you want.

With that function in place, I could make a Fetch request in JavaScript to get the links, then dynamically generate the HTML for each `li`. Here's the snippet. Notice that everything is wrapped inside of the DOMContentLoaded event.

    document.addEventListener('DOMContentLoaded', async () => {
        const linksList = document.getElementById('linksList');
        const url = 'https://jqq-utils.netlify.app/api/recentYTVideos';

        try {
            const res = await fetch(url);
            const videos = await res.json();
            const videosHTML = videos
                .map((video) => {
                    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                    return `<li class="video-link">
                    <button class="btn" data-url="${videoUrl}">Copy URL</button>
                    <a class="btn" href="${videoUrl}" rel="noopener noreferrer" target="_blank">Watch</a>
                    ${video.title}
                </li>
                `;
                })
                .join('');
            linksList.innerHTML = videosHTML;
            const videoLinks = [...document.querySelectorAll('.video-link')];
            videoLinks.forEach((link) => link.addEventListener('click', copy));
        } catch (err) {
            console.error(err);
        }
    });

From there, I needed to add the Copy functionality. This was a little bit hacky, but I couldn't find a better way. Basically, you create an extra DOM element, set its text, copy that text, then remove that DOM element. It works great and the user doesn't even know there's anything weird happening 😁

    const copy = (e) => {
            const str = e.target.dataset.url;
            const el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.removeChild(el);
        };

Here's the full JavaScript file.

    document.addEventListener('DOMContentLoaded', async () => {
        const linksList = document.getElementById('linksList');
        const url = 'https://jqq-utils.netlify.app/api/recentYTVideos';

        const copy = (e) => {
            const str = e.target.dataset.url;
            alert(str);
            const el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.removeChild(el);
        };
        try {
            const res = await fetch(url);
            const videos = await res.json();
            const videosHTML = videos
                .map((video) => {
                    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                    return `<li class="video-link">
                    <button class="btn" data-url="${videoUrl}">Copy URL</button>
                    <a class="btn" href="${videoUrl}" rel="noopener noreferrer" target="_blank">Watch</a>
                    ${video.title}
                </li>
                `;
                })
                .join('');
            linksList.innerHTML = videosHTML;
            const videoLinks = [...document.querySelectorAll('.video-link')];
            videoLinks.forEach((link) => link.addEventListener('click', copy));
        } catch (err) {
            console.error(err);
        }
    });

For finishing touches, I threw in a bit of styling.

    * {
        font-family: sans-serif;
    }

    body {
        border-radius: 10px;
    }
    .container {
        padding: 1rem 0.5rem;
        height: 400px;
        width: 400px;
    }

    #linksList {
        padding-left: 0;
    }

    .video-link {
        width: 100%;
        list-style: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 10px 0;
        color: #333;
    }

    .video-link > a:visited,
    .video-link > a {
        color: #333;
        text-decoration: none;
    }

    .btn {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 5px 10px;
        cursor: pointer;
        background-color: #eee;
        font-size: 12px;
        box-shadow: 1px 1px 5px #ccc;
        transition: 100ms;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 2px 2px 5px #ccc;
    }

With all of that in place, I needed to refresh the extension in Chrome and it worked beautifuly!

![](/images/posts/i-created-my-first-google-chrome-extension/2.png)

## Wrap Up

I was wondering how difficult creating a Chrome extension was going to be, but it proved to not be too bad. I love that I can use my existing HTML, CSS, and JS knowledge to put something together pretty quickly!
