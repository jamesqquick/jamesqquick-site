module.exports = {
  // Global CloudCannon configuration

  // Read from ./src instead of .
  source: "src",

  // Write to ./output/_cloudcannon/info.json instead of ./_cloudcannon/info.json
  output: "output",

  // Populates the sidebar navigation and provides metadata for the editor
  collections_config: {
    posts: {
      // Reads the contents of each file in this directory
      path: "_posts",

      // How to parse the files in this collection
      parser: "front-matter",

      // The URL function for items in this collection
      url: (filePath, parsed, { filters }) => {
        const year = new Date(parsed.date).getFullYear();
        const slug = filters.slugify(parsed.title || "");
        return `/posts/${year}/${slug}/`;
      },

      output: true,
    },
  },

  // Generates the data for select and multiselect inputs matching these names
  data_config: {
    authors: {
      // Reads the contents of this file
      path: "data/authors.csv",
    },
    offices: {
      // Reads the contents of each file in this directory
      path: "data/offices",
      parser: "json",
    },
  },
};
