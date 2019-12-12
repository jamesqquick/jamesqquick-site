import React from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import NewsletterForm from "../components/newsletterForm";

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
            I’m a Full-Stack Web Developer who is addicted to learning and loves
            working with people. I speak at community events, participate in
            Hackathons, and build continuously.
          </p>
          <NewsletterForm />
        </section>
      </div>
    </Layout>
  );
}
