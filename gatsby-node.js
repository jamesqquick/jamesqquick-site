const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");
const moment = require("moment");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const talkPage = path.resolve("./src/templates/talk.js");

  const talksResult = await graphql(
    `
      query {
        allSanityTalk(sort: { order: DESC, fields: publishedDate }) {
          nodes {
            _id
            slug {
              current
            }
          }
        }
      }
    `
  );

  if (talksResult.errors) {
    throw talksResult.errors;
  }

  const talks = talksResult.data.allSanityTalk.nodes;

  talks.forEach(talk => {
    createPage({
      path: "/talks/" + talk.slug.current,
      component: talkPage,
      context: {
        id: talk._id,
      },
    });
  });

  const blogPost = path.resolve("./src/templates/blogPost.js");

  const postsResult = await graphql(
    `
      query {
        allSanityPost(sort: { order: DESC, fields: publishedDate }) {
          nodes {
            _id
            slug {
              current
            }
          }
        }
      }
    `
  );

  if (postsResult.errors) {
    throw postsResult.errors;
  }

  const posts = postsResult.data.allSanityPost.nodes;

  posts.forEach((post, index) => {
    createPage({
      path: "/blog/" + post.slug.current,
      component: blogPost,
      context: {
        id: post._id,
      },
    });
  });
};
