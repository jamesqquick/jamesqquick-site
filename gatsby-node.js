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
      query TalksQuery {
        allMarkdownRemark(
          sort: { order: DESC, fields: frontmatter___publishDate }
          filter: {
            frontmatter: { published: { eq: true } }
            fileAbsolutePath: { regex: "//talks//" }
          }
        ) {
          edges {
            node {
              html
              id
              frontmatter {
                title
                date(formatString: "MM/DD/YYYY")
                slug
                link
                conference
                linkText
              }
            }
          }
        }
      }
    `
  );

  if (talksResult.errors) {
    throw talksResult.errors;
  }

  const rawTalks = talksResult.data.allMarkdownRemark.edges;
  const talks = rawTalks.map(talk => ({
    id: talk.node.id,
    html: talk.node.html,
    ...talk.node.frontmatter,
  }));

  talks.forEach(talk => {
    createPage({
      path: talk.slug,
      component: talkPage,
      context: talk,
    });
  });

  const blogPost = path.resolve("./src/templates/blogPost.js");

  const postsResult = await graphql(
    `
      query PostsQuery {
        allMarkdownRemark(
          sort: { order: DESC, fields: frontmatter___publishDate }
          filter: {
            frontmatter: { published: { eq: true } }
            fileAbsolutePath: { regex: "//posts//" }
          }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                slug
                publishDate
              }
            }
          }
        }
      }
    `
  );

  if (postsResult.errors) {
    throw postsResult.errors;
  }

  const posts = postsResult.data.allMarkdownRemark.edges;

  // const filteredPosts = posts.filter(post => {
  //   const publishDate = post.node.frontmatter.publishDate;
  //   return moment().isAfter(publishDate);
  // });
  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.frontmatter.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });
};
