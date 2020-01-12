import React, { useState, useEffect } from "react";
import PostPreview from "../components/PostPreview";
import SEO from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
export default function blog({ data, location }) {
  const tags = [
    "All Posts",
    "javascript",
    "frontend",
    "backend",
    "web-development",
    "speaking",
    "soft-skills",
    "developer-tools",
    "design",
    "node",
  ];
  const [category, setCategory] = useState("All Posts");

  useEffect(() => {
    if (location.search) {
      const queryParamsArray = location.search.substring(1).split("=");
      if (queryParamsArray[0] === "category") {
        setCategory(queryParamsArray[1]);
      }
    }
  }, []);

  let rawPosts = data.allMarkdownRemark.edges.filter(post =>
    category === "All Posts"
      ? true
      : post.node.frontmatter.tags.includes(category)
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
        <select
          name="categories"
          id="categories"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {tags.map((tag, i) => (
            <option key={i} value={tag} onClick={tagSelected}>
              {tag}
            </option>
          ))}
        </select>
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
            publishDate(formatString: "MM/DD/YYYY")
            tags
            slug
          }
        }
      }
    }
  }
`;
