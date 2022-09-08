---
layout: '../../layouts/BlogPostLayout.astro'
title: Setup a Custom Domain with Netlify
slug: setup-a-custom-domain-with-netlify
coverImage: /images/posts/setup-a-custom-domain-with-netlify/cover.png
pubDate: 2022-07-14
description: Setup a Custom Domain with Netlify
youTubeVideoId: bY7Tkh9Vz8I
---

Websites are always better with custom domains. Let's learn how to set up a custom domain with your Netlify app in just a few minutes.

## Prerequisites

There are two prerequisites here.

- have an already purchased domain (I prefer to use [Namecheap](https://www.namecheap.com/))
- have a site already deployed to Netlify (I'll be using my [DevYearbook](https://www.devyearbook.io/) project)

## Add the Domain in Netlify

Inside of the Netlify dashboard, navigate to your domain settings and click "Add custom domain"

![](/images/setup-a-custom-domain-with-netlify/1.png)

Enter the name of your domain and click "Verify".

![](/images/setup-a-custom-domain-with-netlify/2.png)

Then, acknowledge that you own the domain and click "Add domain".

![](/images/setup-a-custom-domain-with-netlify/3.png)

After that has finished, click on the options menu next to your new domain and choose "Set up Netlify DNS".

![](/images/setup-a-custom-domain-with-netlify/4.png)

Follow the steps here by choosing "Verify", then "Add Domain", and "Continue". Then when you get to the screen about domain name servers, copy those name servers.

![](/images/setup-a-custom-domain-with-netlify/5.png)

Then, in the dashboard where you bought your domain (mine is Namecheap), set the DNS to custom DNS and add the DNS names from Netlify.

![](/images/setup-a-custom-domain-with-netlify/6.png)

After that, you should be good to go. Although you may need to wait a few minutes for the settings to propogate, you should eventually see the "Netlify DNS" tag associated with your domain name.

![](/images/setup-a-custom-domain-with-netlify/7.png)
