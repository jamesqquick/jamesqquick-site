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
          I’m a Full-Stack Web Developer who is addicted to learning and loves
          working with people. I speak at community events, participate in
          Hackathons, and build continuously.
        </p>
        <h2>Learn. Build. Teach.</h2>
        <p>
          One of my favorite mottos is <strong>Learn.Build.Teach.</strong> The
          idea is that you spend lots of time learning. Use what you learn to
          build stuff that gets you excited. Then, teach other people how to do
          it.
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
