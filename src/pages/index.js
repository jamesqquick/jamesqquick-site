import React from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Layout from "../components/layout";
import SEO from "../components/seo";

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
    <section className="section text-center section-full-height">
      <h1 className="text-center section-title">James Q Quick</h1>
      <hr className="title-underline" />
      <h3 className="section-subtitle">Developer. Speaker. Teacher.</h3>
      <p className="section-content">
        I’m a Full-Stack Web Developer who is addicted to learning and loves
        working with people. I speak at community events, participate in
        Hackathons, and build continuously.
      </p>

      <SocialFollow size="md" color="dark" />
      {/* <FontAwesomeIcon
        className="absolute-bottom"
        icon={faAngleDown}
        size="6x"
        fixedWidth
        id="downArrow"
      /> */}
    </section>
  </Layout>
);

export default IndexPage;
