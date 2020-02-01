import React from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/hero.scss";
import SocialFollow from "../components/SocialFollow";

const IndexPage = () => (
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
    <div id="hero" className="container ">
      <h1 className="title">James Q Quick</h1>
      <hr className="title-underline" />
      <h3 className="subtitle">Developer. Speaker. Teacher.</h3>
      <p>
        I’m a Full-Stack Web Developer who is addicted to learning and loves
        working with people. I speak at community events, participate in
        Hackathons, and build continuously.
      </p>

      <SocialFollow size="md" color="dark" />
    </div>
  </Layout>
);

export default IndexPage;
