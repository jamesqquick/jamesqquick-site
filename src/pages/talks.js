import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import TalkPreview from "../components/talkPreview";
export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);

  return (
    <Layout>
      <SEO title="Talks" keywords={[`conference talks`]} />
      <section className="section section-light">
        <div className="container talk">
          <h1 className="text-center section-title">TALKS</h1>
          <hr className="title-underline" />
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
    allTalksJson {
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
