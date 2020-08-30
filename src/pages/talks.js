import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import CardList from "../components/CardList";
import prefixPath from "../utils/prefixPath";

export default function talks({ data }) {
  const blurbHeader = "Intersted in me speaking at your event?";

  const talks = data.allSanityTalk.nodes.map(node => ({
    ...node,
    slug: prefixPath("talks", node.slug.current),
    tags: node.tags.map(tag => tag.title),
    title: `${node.title} (${node.conference})`,
  }));
  return (
    <Layout>
      <SEO title="Speaking" keywords={[`conference talks`]} />
      <header className="header">
        <h1 className="h1 title">Speaking</h1>
        <hr className="title-underline" />
        <ContactBlurb header={blurbHeader} />
      </header>
      <section>
        <CardList cards={talks} />
      </section>
    </Layout>
  );
}

export const query = graphql`
  query {
    allSanityTalk(sort: { order: DESC, fields: [publishedDate] }) {
      nodes {
        title
        slug {
          current
        }
        mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })
        conference
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
