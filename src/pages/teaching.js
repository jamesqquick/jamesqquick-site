import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
export default function teaching() {
  const blurbHeader =
    "Interested in me recording content for you or leading a training?";
  return (
    <Layout>
      <SEO
        title="Teaching"
        keywords={[
          `teaching`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <section className="section section-light">
        <div className="container">
          <h1 className="text-center section-title">TEACHING</h1>
          <hr className="title-underline" />
          <ContactBlurb header={blurbHeader} />

          <h3 className="section-subtitle">
            I've got a passion for Web Development that I want to share with
            you!
          </h3>
        </div>
      </section>
    </Layout>
  );
}
