import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { graphql } from "gatsby";
import CardList from "../components/CardList";
import prefixPath from "../utils/prefixPath";

export default function live({ data }) {
  const streams = data.allSanityStream.nodes.map(node => ({
    ...node,
    slug: prefixPath("streams", node.slug.current),
    tags: node.tags.map(tag => tag.title),
    publishedDate: node.publishedDate.utc,
  }));

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const previousStreams = streams.filter(
    stream => new Date(stream.publishedDate) < currentDate
  );
  const upcomingStreams = streams
    .filter(stream => new Date(stream.publishedDate) >= currentDate)
    .reverse();

  return (
    <Layout>
      <SEO
        title="Streaming"
        keywords={[`live, live stream, streaming, twitch`]}
      />
      <header className="header">
        <h1 className="h1 title">Streaming</h1>
        <hr className="title-underline" />
        <p>
          <a
            href="https://www.twitch.tv/jamesqquick"
            className="text-twitch social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitch} size="2x" />
          </a>
          You can find me on Twitch where I will stream about Web Development,
          Design, Tools, People Skills, etc.
        </p>
      </header>
      {upcomingStreams.length > 0 && (
        <section className="section">
          <h2 className="h2">Upcoming Streams...</h2>
          <CardList cards={upcomingStreams} />
        </section>
      )}
      <section className="section">
        <h2 className="h2">Previous Streams...</h2>
        <CardList cards={previousStreams} />
      </section>
    </Layout>
  );
}

export const query = graphql`
  query {
    allSanityStream(sort: { order: DESC, fields: publishedDate___utc }) {
      nodes {
        title
        slug {
          current
        }
        _id

        mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })

        excerpt
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
        publishedDate {
          utc(formatString: "MM/DD/YYYY")
          local(formatString: "MM/DD/YYYY")
        }
        tags {
          title
        }
      }
    }
  }
`;
