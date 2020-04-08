import React, { useState, useEffect } from "react";
import SEO from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
import moment from "moment";
import Card from "../components/Card";
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
    "vscode",
    "react",
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

  // const filteredPosts = rawPosts.filter(post => {
  //   const publishDate = post.node.frontmatter.publishDate;
  //   return moment().isAfter(publishDate);
  // });

  const posts = rawPosts.map(post => ({
    id: post.node.id,
    excerpt: post.node.excerpt,
    ...post.node.frontmatter,
    tags: post.node.frontmatter.tags.replace(" ", "").split(","),
  }));

  const displayTags = post => {
    return (
      <small>
        Tags:{" "}
        {post.tags.map((tag, i) => (
          <small key={i} className="post--tag">
            {tag}
          </small>
        ))}
      </small>
    );
  };

  return (
    <Layout>
      <SEO title="Blog" keywords={[`blog`]} type="blog" />
      <div className="container">
        <h1 className="title">Blog</h1>
        <hr className="title-underline" />
        <ul>
          {posts.map(post => (
            <Card
              title={post.title}
              details={post.publishDate}
              description={post.excerpt}
              link={post.slug}
            >
              {displayTags(post)}
            </Card>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
export const query = graphql`
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
          excerpt
          frontmatter {
            title
            publishDate(formatString: "MM/DD/YYYY")
            tags
            slug
            coverImage {
              publicURL
              childImageSharp {
                sizes(maxWidth: 2000) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    }
  }
`;
