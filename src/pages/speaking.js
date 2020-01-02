import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import TalkPreview from "../components/TalkPreview";
import ContactBlurb from "../components/ContactBlurb";
import Img from "gatsby-image";

export default function talks() {
  const talksData = useStaticQuery(graphql`
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
  `);
  const talks = talksData.allTalksJson.edges.map(item => item.node);
  const blurbHeader = "Intersted in me speaking at your event?";
  const speakingPicture = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "speaking.jpg" }) {
        childImageSharp {
          # Specify the image processing specifications right in the query.
          # Makes it trivial to update as your page's design changes.
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `);
  return (
    <Layout>
      <SEO title="Speaking" keywords={[`conference talks`]} />
      <div className="container">
        <h1 className="text-center section-title">Speaking</h1>
        <hr className="title-underline" />
        <p>
          I began my speaking career as a Technical Evangelist at Microsoft and
          have loved it ever since. I’ve spoken and mentored at events across
          the nation and am always looking for new opportunities.
        </p>
        <ContactBlurb header={blurbHeader} />
        <Img
          fluid={speakingPicture.file.childImageSharp.fluid}
          alt="James Q Quick speaking"
        />
        {talks.map(talk => (
          <TalkPreview key={talk.id} talk={talk}></TalkPreview>
        ))}
      </div>
    </Layout>
  );
}
