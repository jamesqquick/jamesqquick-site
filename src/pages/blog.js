import React from "react";
import SEO from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
import CardList from "../components/CardList";
export default function blog({ data, location }) {
  let posts = data.allSanityPost.nodes.map(post => ({
    ...post,
    slug: post.slug.current,
    tags: post.tags.map(tag => tag.title),
  }));

  return (
    <Layout>
      <SEO title="Blog" keywords={[`blog`]} type="blog" />
      <div className="container">
        <h1 className="title">Blog</h1>
        <hr className="title-underline" />
        <CardList cards={posts} />
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
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
      }
    }
  }
`;
