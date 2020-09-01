import React from "react";
import { Link, graphql } from "gatsby";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/hero.scss";
import prefixPath from "../utils/prefixPath";
import { Bounce } from "react-awesome-reveal";
import Header from "../components/Header";
import CardList from "../components/CardList";

const IndexPage = props => {
  const { data } = props;
  const posts = data.allSanityPost.nodes.map(post => ({
    ...post,
    slug: prefixPath("blog", post.slug.current),
    tags: post.tags.map(tag => tag.title),
  }));
  const videos = data.allSanityYtVideo.nodes;
  const streams = data.allSanityStream.nodes.map(node => ({
    ...node,
    slug: prefixPath("streams", node.slug.current),
    tags: node.tags.map(tag => tag.title),
    publishedDate: node.publishedDate.utc,
  }));
  const courses = data.allSanityCourse.nodes.map(node => ({
    ...node,
    slug: prefixPath("courses", node.slug.current),
    tags: node.tags.map(tag => tag.title),
  }));
  return (
    <Layout>
      <SEO title="Home" />
      <header className="header">
        <Header fixed={data.file.childImageSharp.fixed} />
      </header>
      <section className="section">
        <h2 className="h2 flex flex-wrap">
          <span className="weight-regular">I do videos </span>
          <Bounce triggerOnce={true}>
            <a
              href="https://www.youtube.com/jamesqquick"
              target="_blank"
              rel="noopener noreferrer"
              className="fancy-anchor"
            >
              YOUTUBE
            </a>
          </Bounce>
        </h2>
        <p>
          With hundreds of videos and over 10,000 subscribers, I've been
          creating YouTube videos for about 7 years. I create weekly videos on
          Web Development.
        </p>
        <div className="image-gallery">
          {videos.map(video => (
            <a
              key={video._id}
              href={video.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img src={video.coverImage.asset.fluid.src} alt={video.title} />
            </a>
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="h2 flex flex-wrap">
          <span className="weight-regular">I create </span>
          <Bounce triggerOnce={true}>
            <Link to="/courses" className="fancy-anchor">
              COURSES
            </Link>
          </Bounce>
        </h2>
        <p>
          I love to teach, and I've create courses on Web Development,
          JavaScript, React, and more. I love being able to put the things I've
          learned into a package for others to learn from.
        </p>
        <CardList cards={courses} />
      </section>
      <section className="section">
        <h2 className="h2 flex flex-wrap">
          <span className="weight-regular">I live stream </span>
          <Bounce triggerOnce={true}>
            <a
              href="https://www.twitch.tv/jamesqquick"
              target="_blank"
              rel="noopener noreferrer"
              className="fancy-anchor"
            >
              TWITCH
            </a>
          </Bounce>
        </h2>
        <p>
          Live Streaming is the new hotness in the developer communitty, and
          I've definitely jumped on board. I love having live interaction with
          viewers while writing code. Come hang out with me in a live stream!
        </p>
        <CardList cards={streams} imageOnly={true} />
      </section>

      <section className="section">
        <h2 className="h2 flex flex-wrap">
          <span className="weight-regular">I write </span>
          <Bounce triggerOnce={true}>
            <Link to="/blog" className="fancy-anchor">
              ARTICLES
            </Link>
          </Bounce>
        </h2>{" "}
        <CardList imageOnly={true} cards={posts} />
      </section>
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query {
    file(relativePath: { eq: "images/headshot.png" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fixed(width: 256, height: 256) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    allSanityPost(sort: { order: DESC, fields: [publishedDate] }, limit: 3) {
      nodes {
        title
        slug {
          current
        }
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
        tags {
          title
        }
      }
    }
    allSanityCourse(limit: 3, sort: { order: DESC, fields: [publishedDate] }) {
      nodes {
        title
        courseLink
        slug {
          current
        }
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        tags {
          title
        }
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
      }
    }
    allSanityStream(
      limit: 3
      sort: { order: DESC, fields: publishedDate___utc }
    ) {
      nodes {
        title
        slug {
          current
        }
        _id
        publishedDate {
          utc(formatString: "MM/DD/YYYY")
        }
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
    allSanityYtVideo {
      nodes {
        title
        _id
        link
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
      }
    }
  }
`;
