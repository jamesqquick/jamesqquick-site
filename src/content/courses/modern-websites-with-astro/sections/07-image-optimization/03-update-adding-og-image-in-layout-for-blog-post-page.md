---
slug: update-adding-og-image-in-layout-for-blog-post-page
title: UPDATE - Adding OG Image in Layout for Blog Post Page
moduleSlug: image-optimization
moduleTitle: Image Optimization
moduleOrder: 7
lessonOrder: 3
published: true
duration: ""
summary: ""
videoId: ""
transcript: ""
resources: []
---

# UPDATE - Adding OG Image in Layout for Blog Post Page

When recording originally, one update was missed after integrating the Astro Image component. The OG image passed into the `Layout` component for a blog post page should use the URL produced from frontmatter image data.

```js
import { Image, getImage } from "astro:assets";

// existing code ...

const coverImageSource = (await getImage({ src: post.data.image })).src;
```

Then pass that value into the `Layout` component:

```astro
<Layout title={post.data.title} image={coverImageSource}>
```

To confirm, navigate to a blog post page and inspect the HTML for the `og:image` property.

View full code in the GitHub repository:
[https://github.com/jamesqquick/astro-course-demo/blob/ssg/src/pages/blog/%5Bslug%5D.astro](https://github.com/jamesqquick/astro-course-demo/blob/ssg/src/pages/blog/%5Bslug%5D.astro)
