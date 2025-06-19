---
title: TypeScript and Databases - Keep Your Types In Sync With Xata
slug: typescript-databases-types-sync-xata
coverImage: ./cover.jpeg
pubDate: 2023-03-29T15:20:06.873Z
description: Learn how Xata's codegen keeps types in sync with your database.
youTubeVideoId: -j5nf_PNpE8
tags:
  - tools
---

TypeScript is growing every day, and your database should be growing with it. In recent years, the growth of TypeScript has become one of the hottest topics in web development. As more and more job requirements and postings emphasize TypeScript, now is the time to consider a better way to integrate database and code.

Let’s talk about the struggle of keeping TypeScript types and database models in sync. Then, let’s explore [Xata’s](https://xata.io) unique TypeScript integration and codegen feature.

## The Struggle of Keeping TypeScript Types and Your Database in Sync

One of the challenges when using TypeScript is maintaining accurate and up-to-date TypeScript types that represent data in your database. If your workflows don't keep your types in sync, you may encounter errors or missing data, which can become a headache.

I have this struggle with the Discord Bot for my [Learn Build Teach Discord](https://learnbuildteach.com/). It’s a Node.js project that uses TypeScript and [Supabase](https://supabase.com/) for the database. With this project, I have various interfaces defined for different database models. **When I update the data structure in the database, I then have to manually update the interfaces in my TypeScript files and redeploy code.**

This process is not only tedious and error-prone, but it can also lead to inefficiency and difficulties in maintaining code throughout the development lifecycle. What if that code generation could be done for you?

## Enter Xata: A Database with Built-in TypeScript Integration

[Xata](https://www.xata.com/) offers a solution to this challenge by providing built-in TypeScript integration through its [SDK/client](https://xata.io/docs/typescript-client/overview) and its [code generation feature through its CLI](https://xata.io/docs/cli/codegen).

The code generation feature in Xata (`xata-cogen`) is designed to help you generate TypeScript code and types that match your database's data models automatically. With the `xata-cogen` command, you can generate a client file that includes all the types you need to work with your data models in TypeScript. Here you can see the types generated for a job table.

![Generated typesscript types from Xata codegen](/images/posts/typescript-databases-types-sync-xata/1.jpeg)Here's how this works in practice:

1. Create a Xata configuration file (`.xatarc`) to configure your Xata project, database, and output folder.

```json
{
  "databaseURL": "https://James-Q-Quick-s-workspace-l5kbra.us-east-1.xata.sh/db/jqq-job-board",
  "codegen": {
    "output": "src/xata.ts"
  }
}
```

2. Install the [Xata CLI](https://xata.io/docs/getting-started/installation)

3. Run the `xata-cogen` command to generate the TypeScript code for your project, syncing your database and TypeScript types.

4. Import the generated Xata client into your code and use it to access your data models, leveraging TypeScript types.

The code generation ensures that you're always using up-to-date TypeScript types in your code, making it easy to keep your database and TypeScript in sync throughout your project's development.

## Conclusion

TypeScript's popularity continues to rise in the web development world, and it's more important than ever to ensure seamless integration between TypeScript code and databases. Xata offers a powerful solution to this challenge with its built-in TypeScript integration and code generation features. Instead of manually maintaining TypeScript types and struggling to keep your code in sync with your database, Xata can take care of it for you!

Happy coding!
