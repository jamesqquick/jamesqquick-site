import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import CardList from "../components/CardList";
export default function talks({ data }) {
  const blurbHeader = "Intersted in me speaking at your event?";

  const talks = data.allSanityTalk.nodes.map(node => ({
    ...node,
    slug: node.slug.current,
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
        body
        videoLink
        slidesLink
        conferenceLink
        conference
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        tags {
          title
        }
      }
    }
  }
`;
