import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";
import Stream from "../components/Stream";

export default function talk({ data }) {
  const stream = {
    ...data.sanityStream,
    slug: data.sanityStream.slug.current,
    tags: data.sanityStream.tags.map(tag => tag.title),
  };
  let coverImageUrl = undefined;
  if (stream.coverImage) {
    coverImageUrl = stream.coverImage.asset.fluid.src;
  }
  return (
    <Layout>
      <SEO
        title={stream.title}
        keywords={[`${stream.title}`]}
        type="blog"
        description={stream.excerpt}
        image={coverImageUrl}
      />
      <Stream post={stream} />
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
      youTubeVideoId
      topic
      guestName
      guestTitle
      guestBio: _rawGuestBio(resolveReferences: { maxDepth: 10 })
      guestImage {
        asset {
          fluid(maxWidth: 700) {
            ...GatsbySanityImageFluid
          }
        }
      }
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
