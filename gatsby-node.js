const path = require("path");
const { CreateFilePath } = require("gatsby-source-filesystem");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const talkPage = path.resolve("./src/pages/talk.js");

  const result = await graphql(
    `
      {
        allTalksJson {
          edges {
            node {
              title
              conference
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
      title,
      conference,
      id,
      slidesLink,
    } = talk.node;
    createPage({
      path: slug,
      component: talkPage,
      context: {
        slug,
        date,
        title,
        conference,
        imageUrl,
        description,
        id,
        slidesLink,
      },
    });
  });
};
