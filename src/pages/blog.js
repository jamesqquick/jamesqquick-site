import React from "react";
import Seo from "../components/SEO";
import Layout from "../components/Layout";
import { graphql } from "gatsby";
import CardList from "../components/CardList";
import prefixPath from "../utils/prefixPath";

export default function blog({ data, location }) {
  let posts = data.allSanityPost.nodes.map(post => ({
    ...post,
    slug: prefixPath("blog", post.slug.current),
    tags: post.tags.map(tag => tag.title),
  }));

  return (
    <Layout>
      <Seo title="Blog" keywords={[`blog`]} type="blog" />
      <header className="header">
        <h1 className="h1 title">Blog</h1>
        <hr />
      </header>
      <section className="section">
        <CardList cards={posts} />
      </section>
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
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        tags {
          title
        }
        coverImage {
          asset {
            gatsbyImageData
          }
        }
      }
    }
  }
`;
