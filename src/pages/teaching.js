import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
export default function teaching() {
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
          <h3 className="section-subtitle">
            I've got a passion for Web Development that I want to share with
            you!
          </h3>
        </div>
      </section>
    </Layout>
  );
}
