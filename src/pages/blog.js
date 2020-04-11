import React, { useState, useEffect } from "react";
import SEO from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
import moment from "moment";
import Card from "../components/Card";
export default function blog({ data, location }) {
  let posts = data.allSanityPost.nodes.map(post => ({
    ...post,
    slug: post.slug.current,
    tags: post.tags.map(tag => tag.title),
  }));

  const displayTags = tags => {
    return (
      <small>
        Tags:{" "}
        {tags.map((tag, i) => (
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
              details={post.publishedDate}
              description={post.excerpt}
              link={post.slug}
              key={post._id}
            >
              {displayTags(post.tags)}
            </Card>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
export const query = graphql`
  query {
    allSanityPost(sort: { order: DESC, fields: [publishedDate] }) {
      nodes {
        title
        slug {
          current
        }
        body
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        tags {
          title
        }
      }
    }
  }
`;
