import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { graphql } from "gatsby";
import Card from "../components/Card";
import ReactLivestream from "react-livestream";
export default function live({ data }) {
  const streams = data.allSanityStream.nodes.map(node => ({
    ...node,
    slug: node.slug.current,
    tags: node.tags.map(tag => tag.title),
  }));

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const previousStreams = streams
    .filter(stream => new Date(stream.publishedDate) < currentDate)
    .reverse();
  const upcomingStreams = streams.filter(
    stream => new Date(stream.publishedDate) >= currentDate
  );

  return (
    <Layout>
      <SEO
        title="Streaming"
        keywords={[`live, live stream, streaming, twitch`]}
      />
      <div className="container">
        <h1 className="title">Streaming</h1>
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
        <ReactLivestream
          platform="twitch"
          twitchClientId={process.env.GATSBY_TWITCH_CLIENT_ID}
          twitchUserName="jamesqquick"
          mixerChannelId={() => {}}
        />
        <h2>Upcoming Streams...</h2>
        <ul>
          {upcomingStreams.map(stream => (
            <Card
              title={stream.title}
              details={stream.publishedDate}
              description={stream.excerpt}
              link={stream.videoLink}
              isLinkLocal={false}
              key={stream._id}
            ></Card>
          ))}
        </ul>
        <h2>Previous Streams...</h2>
        <ul>
          {previousStreams.map(stream => (
            <Card
              title={stream.title}
              details={stream.publishedDate}
              description={stream.excerpt}
              link={stream.videoLink}
              isLinkLocal={false}
              key={stream._id}
            ></Card>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query {
    allSanityStream(sort: { order: DESC, fields: [publishedDate] }) {
      nodes {
        title
        slug {
          current
        }
        body
        videoLink
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
