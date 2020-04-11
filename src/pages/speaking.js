import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import Card from "../components/Card";
export default function talks({ data }) {
  const blurbHeader = "Intersted in me speaking at your event?";

  const talks = data.allSanityTalk.nodes.map(node => ({
    ...node,
    slug: node.slug.current,
    tags: node.tags.map(tag => tag.title),
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
              key={talk._id}
              title={talk.title}
              link={talk.slug}
              description={talk.excerpt}
              details={talk.publishedDate}
            >
              <p>
                Conference -
                <a href={talk.conferenceLink} target="_blank">
                  {talk.conference}
                </a>
              </p>
            </Card>
          ))}
        </ul>
      </div>
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
