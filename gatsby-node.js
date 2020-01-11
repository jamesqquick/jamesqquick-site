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

  if (talksResult.errors) {
    throw talksResult.errors;
  }

  const talks = talksResult.data.allTalksJson.edges;

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
              excerpt
              frontmatter {
                title
                publishDate
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
