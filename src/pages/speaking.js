import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import Card from "../components/Card";
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
        <ul>
          {talks.map(talk => (
            <Card
              key={talk.id}
              title={talk.title}
              link={talk.slug}
              description={talk.excerpt}
              details={talk.date}
            >
              <p>{talk.conference}</p>
            </Card>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query TalksQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: frontmatter___date }

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
            link
            conference
          }
        }
      }
    }
  }
`;
