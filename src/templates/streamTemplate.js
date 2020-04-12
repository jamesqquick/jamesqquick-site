import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";
import Post from "../components/Post";

export default function talk({ data }) {
  const stream = {
    ...data.sanityStream,
    slug: data.sanityStream.slug.current,
    tags: data.sanityStream.tags.map(tag => tag.title),
  };
  return (
    <Layout>
      <SEO title={stream.title} keywords={[`live stream`]} />
      <Post post={stream} />
    </Layout>
  );
}

export const pageQuery = graphql`
  query StreamById($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    sanityStream(_id: { eq: $id }) {
      title
      slug {
        current
      }
      body
      _id
      videoLink
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
`;