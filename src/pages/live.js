import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { graphql } from "gatsby";
import Card from "../components/Card";
import ReactLivestream from "react-livestream";
export default function live({ data }) {
  const streams = data.allMarkdownRemark.edges.map(edge => ({
    ...edge.node.frontmatter,
    id: edge.node.id,
    html: edge.node.html,
  }));
  const currentDate = new Date();
  const previousStreams = streams
    .filter(stream => new Date(stream.date) <= currentDate)
    .reverse();
  const upcomingStreams = streams.filter(
    stream => new Date(stream.date) > currentDate
  );

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
        <ReactLivestream
          platform="twitch"
          twitchClientId={process.env.GATSBY_TWITCH_CLIENT_ID}
          twitchUserName="jamesqquick"
        />
        <h2>Upcoming Streams...</h2>
        <ul>
          {upcomingStreams.map(stream => (
            <Card
              title={stream.title}
              details={stream.date}
              description={stream.html}
              link={stream.link}
              isLinkLocal={false}
              key={stream.id}
            ></Card>
          ))}
        </ul>
        <h2>Previous Streams...</h2>
        <ul>
          {previousStreams.map(stream => (
            <Card
              title={stream.title}
              details={stream.date}
              description={stream.html}
              link={stream.link}
              isLinkLocal={false}
              key={stream.id}
            ></Card>
          ))}
        </ul>
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
            date(formatString: "MM/DD/YYYY")
            link
            published
          }
        }
      }
    }
  }
`;
