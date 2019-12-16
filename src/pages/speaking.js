import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import TalkPreview from "../components/talkPreview";
import SpeakForm from "../components/SpeakForm";
export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);

  return (
    <Layout>
      <SEO title="Talks" keywords={[`conference talks`]} />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">TALKS</h1>
          <hr className="title-underline" />
          <h3 className="section-subtitle">
            Interesting in me speaking at your event? Let me know!
          </h3>
          <SpeakForm />
          <hr></hr>

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
