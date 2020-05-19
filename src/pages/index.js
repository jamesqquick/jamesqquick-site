import React from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/hero.scss";
import SocialFollow from "../components/SocialFollow";
import CardList from "../components/CardList";

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
      <div className="container ">
        <h1 className="title">James Q Quick</h1>
        <hr className="title-underline" />
        <h3 className="subtitle">Developer. Speaker. Teacher.</h3>
        <p>
          Hi, I’m James, a Web Developer who is addicted to learning and loves
          working with people. I'm also an avid content creator with weekly
          videos on{" "}
          <a
            className="youtube-link"
            href="https://www.youtube.com/jamesqquick"
            target="_blank"
          >
            <strong>YouTube</strong>
          </a>
          , live streams on{" "}
          <a
            className="twitch-link"
            href="https://www.twitch.tv/jamesqquick"
            target="_blank"
          >
            <strong>Twitch</strong>
          </a>
          , and courses/misc content on my{" "}
          <a
            className="brand-link "
            href="learn.jamesqquick.com"
            target="_blank"
          >
            <strong>Learning Platform</strong>
          </a>
          .
        </p>
        <h2>Learn. Build. Teach.</h2>
        <p>This is the motto that I live by with everything I do!</p>

        <ul>
          <li>
            <strong>Learn</strong> new technologies, frameworks, etc.
          </li>
          <li>
            <strong>Build</strong> projects using what you learn
          </li>
          <li>
            <strong>Teach</strong> others how to do it too
          </li>
        </ul>
        <p>
          What's your best <strong>Learn.Build.Teach.</strong> moment?! Share on
          Twitter using the hashtag #LearnBuildTeach.
        </p>

        <h2>Recent Posts</h2>
        <CardList cards={posts} />

        <SocialFollow size="md" color="dark" />
      </div>
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
