import React, { useState, useEffect } from "react";
import PostPreview from "../components/PostPreview";
import SEO from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
export default function blog({ data, location }) {
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (location.search) {
      const queryParamsArray = location.search.substring(1).split("=");
      if (queryParamsArray[0] === "category") {
        setCategory(queryParamsArray[1]);
      }
    }
  }, []);

  let rawPosts = data.allMarkdownRemark.edges.filter(post =>
    !category ? true : post.node.frontmatter.tags.includes(category)
  );
  const posts = rawPosts.map(post => ({
    id: post.node.id,
    html: post.node.html,
    excerpt: post.node.excerpt,
    ...post.node.frontmatter,
  }));

  const tagSelected = tag => {
    console.log("clicked it", tag);
    setCategory(tag);
  };

  return (
    <Layout>
      <SEO title="Blog" keywords={[`blog`]} type="blog" />
      <div className="container">
        <h1 className="title">Blog</h1>
        <hr className="title-underline" />
        {posts.map(post => (
          <PostPreview post={post} key={post.id} tagSelected={tagSelected} />
        ))}
      </div>
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
            slug
          }
        }
      }
    }
  }
`;
