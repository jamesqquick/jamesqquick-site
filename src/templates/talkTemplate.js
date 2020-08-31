import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";
import Post from "../components/Post";
import prefixPath from "../utils/prefixPath";

export default function talk({ data }) {
  const talk = {
    ...data.sanityTalk,
    slug: prefixPath("talks", data.sanityTalk.slug.current),
    tags: data.sanityTalk.tags.map(tag => tag.title),
  };

  return (
    <Layout>
      <SEO title={talk.title} keywords={[``]} />
      <Post post={talk} />
    </Layout>
  );
}

export const pageQuery = graphql`
  query TalkById($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    sanityTalk(_id: { eq: $id }) {
      title
      slug {
        current
      }
      mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })
      _id
      conference
      youTubeVideoId
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
