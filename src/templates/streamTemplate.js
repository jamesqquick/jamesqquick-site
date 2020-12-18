import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";
import Post from "../components/Post";
import WatchTwitch from "../components/WatchTwitch";

export default function talk({ data }) {
  const stream = {
    ...data.sanityStream,
    slug: data.sanityStream.slug.current,
    publishedDate: data.sanityStream.publishedDate.local,
    tags: data.sanityStream.tags.map(tag => tag.title),
  };
  let coverImageUrl = undefined;
  if (stream.coverImage) {
    coverImageUrl = stream.coverImage.asset.fluid.src;
  }

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const showTwitch = new Date(stream.publishedDate) > currentDate;
  return (
    <Layout>
      <SEO
        title={stream.title}
        keywords={[`${stream.title}`]}
        type="blog"
        description={stream.excerpt}
        image={coverImageUrl}
      />
      {showTwitch && <WatchTwitch />}
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
      mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })
      _id
      youTubeVideoId
      topic
      guestName
      guestTitle
      guestImage {
        asset {
          fluid(maxWidth: 700) {
            ...GatsbySanityImageFluid
          }
        }
      }
      publishedDate {
        local(formatString: "MM/DD/YYYY")
      }
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
