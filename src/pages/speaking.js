import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import TalkPreview from "../components/TalkPreview";
import ContactBlurb from "../components/ContactBlurb";
export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);
  const blurbHeader = "Intersted in me speaking at your event?";

  return (
    <Layout>
      <SEO title="Speaking" keywords={[`conference talks`]} />
      <div className="container">
        <h1 className="text-center section-title">Speaking</h1>
        <hr className="title-underline" />
        <ContactBlurb header={blurbHeader} />
        {talks.map(talk => (
          <TalkPreview key={talk.id} talk={talk}></TalkPreview>
        ))}
      </div>
    </Layout>
  );
}

export const query = graphql`
  query PostsQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___date }
      filter: {
        frontmatter: { published: { eq: true } }
        fileAbsolutePath: { regex: "//talks//" }
      }
    ) {
      edges {
        node {
          html
          frontmatter {
            title
            date(formatString: "MM/DD/YYYY")
            conference
            slug
            id
            slidesLink
          }
        }
      }
    }
  }
`;
