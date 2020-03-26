import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { graphql } from "gatsby";
import Card from "../components/Card";

export default function live({ data }) {
  console.log(data.allMarkdownRemark.edges);
  const streams = data.allMarkdownRemark.edges.map(edge => ({
    ...edge.node.frontmatter,
    id: edge.node.id,
    html: edge.node.html,
  }));
  return (
    <Layout>
      <SEO title="Live" keywords={[`live, live stream, twitch`]} type="blog" />
      <div className="container">
        <h1 className="title">Live</h1>
        <hr className="title-underline" />
        <p>
          <a
            href="https://www.twitch.tv/jamesqquick"
            className="twitch social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitch} size="2x" />
          </a>{" "}
          You can find me on Twitch where I will stream about Web Development,
          Design, Tools, People Skills, etc.
        </p>
        <h1>Upcoming Streams</h1>
        {streams.map(stream => (
          <Card
            title={stream.title}
            details={stream.date}
            description={stream.html}
            link={stream.link}
            isLinkLocal={false}
          ></Card>
        ))}
        <h1>Previous Streams</h1>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query MyQuery {
    allMarkdownRemark(
      sort: { order: ASC, fields: frontmatter___date }
      filter: {
        frontmatter: { published: { eq: true } }
        fileAbsolutePath: { regex: "//livestreams//" }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            title
            date
            link
            published
          }
        }
      }
    }
  }
`;
