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
  const links = [];
  for (let key of Object.keys(talk)) {
    if (talk[key] && key.includes("Link") && !key.includes("external")) {
      const index = key.indexOf("Link");
      const linkText = key.substring(0, index);
      links.push({ text: linkText, target: talk[key] });
    }
  }
  return (
    <Layout>
      <SEO title={talk.title} keywords={[``]} />
      <Post post={talk}>
        {links.length > 0 &&
          links.map((link, index) => (
            <a
              className="post--link"
              href={link.target}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              {link.text}
            </a>
          ))}
      </Post>
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
