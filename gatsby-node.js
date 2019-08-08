const path = require("path");
const { CreateFilePath } = require("gatsby-source-filesystem");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const talkTemplate = path.resolve("./src/templates/talk.js");

  const result = await graphql(
    `
      {
        allTalksJson {
          edges {
            node {
              name
              slug
              description
              imageUrl
              date
              id
              slidesLink
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  const talks = result.data.allTalksJson.edges;

  talks.forEach((talk, index) => {
    const {
      slug,
      date,
      description,
      imageUrl,
      name,
      id,
      slidesLink,
    } = talk.node;
    createPage({
      path: slug,
      component: talkTemplate,
      context: {
        slug,
        date,
        name,
        imageUrl,
        description: description.join(" "),
        id,
        slidesLink,
      },
    });
  });
};
