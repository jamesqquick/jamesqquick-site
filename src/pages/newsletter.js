import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import NewsletterForm from "../components/NewsletterForm";

export default function newsletter() {
  return (
    <Layout>
      <SEO
        title="James Q Quick Newsletter"
        keywords={[
          `newsletter`,
          `web development`,
          `web design`,
          `developer tools`,
          `James Q Quick`,
        ]}
      />
      <div className="">
        <section className="section text-center section-light">
          <h1 className="text-center section-title">Newsletter</h1>
          <hr className="title-underline" />
          <h3 className="section-subtitle">
            Sign up for articles, videos, courses, and more!
          </h3>
          <p className="section-content">
            From soft skills to hard skills and design to development, sign up
            to receive my latest content.
          </p>
          <NewsletterForm />
        </section>
      </div>
    </Layout>
  );
}
