import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import TalkPreview from "../components/talkPreview";
import ContactBlurb from "../components/ContactBlurb";

export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);
  const blurbHeader = "Intersted in me speaking at your event?";

  return (
    <Layout>
      <SEO title="Speaking" keywords={[`conference talks`]} />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">Speaking</h1>
          <hr className="title-underline" />
          <ContactBlurb header={blurbHeader} />
          {talks.map(talk => (
            <TalkPreview key={talk.id} talk={talk}></TalkPreview>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const query = graphql`
  {
    allTalksJson(sort: { fields: date, order: DESC }) {
      edges {
        node {
          title
          conference
          slug
          description
          imageUrl
          date
          id
          slidesLink
        }
      }
    }
  }
`;
