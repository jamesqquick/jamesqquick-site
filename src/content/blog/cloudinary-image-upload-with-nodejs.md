---
title: Cloudinary Image Upload with Nodejs
slug: cloudinary-image-upload-with-nodejs
coverImage: ./images/cloudinary-image-upload-with-nodejs/cover.png
pubDate: 2020-06-16
description: Learn how to upload images to Cloudinary with Nodejs
youTubeVideoId: Rw_QeJLnCK4
tags:
  - nodejs
---

Cloudinary is an amazing product for storing, transforming, and optimizing your media. By using Cloudinary, you can optimize your images and make your websites faster and increase user experience. Let's see how to upload images to Cloudinary using the Node SDK.

## Getting Started

You will need a [Cloudinary](http://cloudinary.com/) account for this to work. Not to worry, they have a very generous free tier!

You will also need to find your Cloudinary name, API Key, and API secret to be able to interact with Cloudinary from Node. You can find all of these details on the dashboard page in Cloudinary (you'll need to explicitly click `reveal` for your API secret).

For the code, create a new folder, open it in your editor, and run `npm init` to initialiize a JavaScript project. Then you'll need to install a couple depencies.

```
npm install express cloudinary dotenv
```

Then, create an `app.js` file. We'll start by scaffolding a basic Express app. The only special thing I did here is to increase the size limit on incoming JSON data so that we can send base64 representations of images to the server.

```
const express = require('express');
const app = express();

app.use(express.json({ limit: '50mb' }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('listening on 3001');
});
```

## Initialize the Cloudinary SDK

We need to initialize the Cloudinary SDK using the credentials mentioned earlier. I'm using local environment variables with the `dotenv` package for mine. If you're not familiar with `dotenv` you can watch this video or simply hard code your credentials.

    require('dotenv').config();
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

## Create the Image Upload Endpoint

First, stub out the basic endpoint.

    app.post('/api/upload', async (req, res) => {

    });

Now, let's actually upload. We will need to get the base64 string representation of the image from the data property of the body. Then we will call `cloudinary.uploader.upload()` to actually upload the image. In case something goes wrong, we surround everything with a `try/catch` to make sure we catch any errors.

    app.post('/api/upload', async (req, res) => {
        try {
            const fileStr = req.body.data;
            const uploadResponse = await cloudinary.uploader.upload(fileStr, {});
            console.log(uploadResponse);
            res.json({ msg: 'yaya' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ err: 'Something went wrong' });
        }
    });

## Testing

To test this, we'll need to make a post request from Postman or a similar tool. We will also need a base64 string representing an image which you can get [here](https://www.base64-image.de/). Just upload your image and you get back a string.

![](/images/cloudinary-image-upload-with-nodejs/1.jpeg)

These strings can get really long so you might want to choose a really simple image. Here's a string I used from a small black rectangle.

    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABEgAAACjCAYAAACZtyuEAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARDSURBVHgB7dgBDcAwDMCw/Tqi8ufWj0dsKSTyzMweAAAAgK59DwAAAECcQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQJ5BAgAAAOQZJAAAAECeQQIAAADkGSQAAABAnkECAAAA5BkkAAAAQN532wMAAADQtT/zaAXag6h60wAAAABJRU5ErkJggg==

Make sure your server is running (`node app.js`).

Now, let's send it along in Postman. You'll need to send a Post request and include the string you just generated as a data property in raw JSON.

![](/images/cloudinary-image-upload-with-nodejs/2.jpeg)

Then, go check in Cloudinary `Media Library` and you should see your new image!

## Wrap Up

I'm super excited about using Cloudinary for more things in the future, but uploading images from Nodejs is a pretty good start. Lots more to come on optimizations, transformations, etc. in the future. Keep an eye out!
