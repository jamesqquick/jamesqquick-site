---
title: Open Anchor Link in New Tab
slug: open-anchor-link-in-new-tab
coverImage: /images/posts/open-anchor-link-in-new-tab/cover.png
pubDate: 2020-04-24
description: Learn how to open a link from an anchor tag in a new browser tab
---

If you include links on your site, you probably want those to open up in a different tab so that users don't completely leave your site. This is certainly true for me site. Recently, i've had to look this up so many times, that I'm finally creating the post.

Here's a basic anchor tag.

    <a href="https://www.jamesqquick.com">My Site</a>

By default this will redirect the user away from your site and stay within the same tab. To open in new tab we add a few small properties.

    <a href="https://www.jamesqquick.com" rel="noopener noreferrer" target="_blank">Twitter</a>

That's it. Now, you're links should open up in a new tab!!
