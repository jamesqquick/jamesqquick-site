const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

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
  const talkPage = path.resolve("./src/pages/talk.js");

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
                slidesLink
                conference
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

  const postPage = path.resolve("./src/pages/blogPost.js");

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
              id
              html
              frontmatter {
                title
                publishDate(formatString: "MM/DD/YYYY")
                tags
                slug
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

  const rawPosts = postsResult.data.allMarkdownRemark.edges;
  const posts = rawPosts.map(post => ({
    id: post.node.id,
    html: post.node.html,
    ...post.node.frontmatter,
  }));

  posts.forEach((post, index) => {
    createPage({
      path: post.slug,
      component: postPage,
      context: post,
    });
  });
};
