---
slug: important-default-port-update
title: IMPORTANT - Default Port Update
moduleSlug: welcome-and-resources
moduleTitle: Welcome and Resources
moduleOrder: 1
lessonOrder: 5
published: true
duration: ""
summary: ""
transcript: ""
resources: []
---

# IMPORTANT - Default Port Update

I originally recorded these videos with Astro 2.0, which used `3000` as the default port. After Astro 3.0, the default port became `4321`. In the videos, you'll see port `3000` used throughout.

For following along, you have two options:

1. Use the default port `4321` (just know yours will differ from the videos).
2. Set your default port to `3000` in `astro.config.mjs`.

```js
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
});
```
