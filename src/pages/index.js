import React from "react";
import { Link } from "gatsby";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/hero.scss";
import CardList from "../components/CardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptopCode } from "@fortawesome/free-solid-svg-icons";
import {
  faYoutube,
  faTwitter,
  faInstagram,
  faTwitch,
} from "@fortawesome/free-brands-svg-icons";
const IndexPage = ({ data }) => {
  let posts = data.allSanityPost.nodes.map(post => ({
    ...post,
    slug: post.slug.current,
    tags: post.tags.map(tag => tag.title),
  }));
  return (
    <Layout>
      <SEO
        title="Home"
        keywords={[
          `web development`,
          `web design`,
          `developer tools`,
          `James Q Quick`,
        ]}
      />
      <header className="header">
        <h1 className="h1 title text-center">
          James <span className="accent">Q</span> Quick
        </h1>
        {/* <hr className="title-underline" /> */}
        <h2 className="h2 subtitle text-center">
          Developer. Speaker. Teacher.
        </h2>
        <p>
          Hi, I’m James, a Fullstack Web Developer who is addicted to learning
          and loves working with people. I live by the motto{" "}
          <strong>Learn. Build. Teach.</strong>, so I’m excited to share the
          things I’ve learned with you!
        </p>
      </header>
      <section className="section">
        <h2 className="h2">
          <a
            href="https://www.youtube.com/c/jamesqquick"
            className=" social-icon text-youtube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faYoutube} />
          </a>
          <span>I Create Videos on </span>
          <a
            href="https://www.youtube.com/jamesqquick"
            target="_blank"
            rel="noopener noreferrer"
            className="fancy-anchor"
          >
            YouTube
          </a>
        </h2>
        <p>
          With hundreds of videos and over 10,000 subscribers, I've been
          creating YouTube videos for about 7 years. I create weekly videos on
          Web Development, Design, and Developer Tools.
        </p>
      </section>
      <section className="section">
        <h2 className="h2">
          <Link to="/courses" className=" social-icon">
            <FontAwesomeIcon icon={faLaptopCode} />
          </Link>
          <span>I create free + premium </span>
          <Link to="/courses" className="fancy-anchor">
            courses
          </Link>
        </h2>
        <p>
          Over the last couple of years, I've created courses on VS Code, Web
          Development basics, Node.js, React.js, and more. I love being able to
          put the things I've learned into a package for others to learn from.
          My goal is to put in the long hard hours so you don't have to!
        </p>
      </section>
      <section className="section">
        <h2 className="h2">
          <a
            href="https://www.twitch.tv/jamesqquick"
            className="text-twitch social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitch} />
          </a>
          <span>I live stream on </span>
          <a
            href="https://www.twitch.tv/jamesqquick"
            target="_blank"
            rel="noopener noreferrer"
            className="fancy-anchor"
          >
            Twitch
          </a>
        </h2>
        <p>
          Live Streaming is the new hotness in the developer communitty, and
          I've definitely jumped on board. I love having live interaction with
          viewers while writing code. Come hang out with me in a live stream!
        </p>
      </section>
      <section className="section">
        <h2 className="h2">Recent Posts</h2>
        <CardList cards={posts} />
      </section>
    </Layout>
  );
};

export default IndexPage;

export const query = graphql`
  query {
    allSanityPost(sort: { order: DESC, fields: [publishedDate] }, limit: 5) {
      nodes {
        title
        slug {
          current
        }
        body
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
