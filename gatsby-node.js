const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");
const prefixPath = require("./src/utils/prefixPath");
const fetch = require("node-fetch");
const { clearConfigCache } = require("prettier");

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

  const coursePage = path.resolve("./src/templates/courseTemplate.js");

  const coursesResult = await graphql(
    `
      query {
        allSanityCourse(sort: { order: DESC, fields: publishedDate }) {
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

  if (coursesResult.errors) {
    throw coursesResult.errors;
  }

  const courses = coursesResult.data.allSanityCourse.nodes;

  courses.forEach(course => {
    createPage({
      path: prefixPath("courses", course.slug.current),
      component: coursePage,
      context: {
        id: course._id,
      },
    });
  });

  const streamPage = path.resolve("./src/templates/streamTemplate.js");

  const streamsResult = await graphql(
    `
      query {
        allSanityStream(sort: { order: DESC, fields: publishedDate___utc }) {
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

  if (streamsResult.errors) {
    throw streamsResult.errors;
  }

  const streams = streamsResult.data.allSanityStream.nodes;

  streams.forEach(stream => {
    createPage({
      path: prefixPath("streams", stream.slug.current),
      component: streamPage,
      context: {
        id: stream._id,
      },
    });
  });

  const talkPage = path.resolve("./src/templates/talkTemplate.js");

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
      path: prefixPath("talks", talk.slug.current),
      component: talkPage,
      context: {
        id: talk._id,
      },
    });
  });

  const blogPost = path.resolve("./src/templates/blogPostTemplate.js");

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

  posts.forEach(post => {
    createPage({
      path: prefixPath("blog", post.slug.current),
      component: blogPost,
      context: {
        id: post._id,
      },
    });
  });
};
