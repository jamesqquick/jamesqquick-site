import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import TalkPreview from "../components/TalkPreview";
import ContactBlurb from "../components/ContactBlurb";
export default function talks({ data }) {
  const blurbHeader = "Intersted in me speaking at your event?";

  const talks = data.allMarkdownRemark.edges.map(talk => ({
    id: talk.node.id,
    excerpt: talk.node.excerpt,
    ...talk.node.frontmatter,
  }));
  return (
    <Layout>
      <SEO title="Speaking" keywords={[`conference talks`]} />
      <div className="container">
        <h1 className="text-center title">Speaking</h1>
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
  query TalksQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___publishDate }
      filter: {
        frontmatter: { published: { eq: true } }
        fileAbsolutePath: { regex: "//talks//" }
      }
    ) {
      edges {
        node {
          excerpt
          id
          frontmatter {
            title
            date(formatString: "MM/DD/YYYY")
            slug
            slidesLink
            conference
          }
        }
      }
    }
  }
`;
