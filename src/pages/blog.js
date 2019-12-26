import React from "react";
import PostPreview from "../components/PostPreview";
import SEO from "../components/Seo";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
export default function blog({ data }) {
  const rawPosts = data.allMarkdownRemark.edges;
  const posts = rawPosts.map(post => ({
    id: post.node.id,
    html: post.node.html,
    excerpt: post.node.excerpt,
    ...post.node.frontmatter,
  }));

  return (
    <Layout>
      <SEO title="Blog" keywords={[`blog`]} type="blog" />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">Blog</h1>
          <hr className="title-underline" />
          {posts.map(post => (
            <PostPreview post={post} key={post.id} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const query = graphql`
  query PostsQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___publishDate }
      filter: { frontmatter: { published: { eq: true } } }
    ) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            publishDate
            tags
            coverImage
            slug
          }
        }
      }
    }
  }
`;
