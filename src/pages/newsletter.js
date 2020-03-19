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
      <div className="container">
        <h1 className="title">Newsletter</h1>
        <hr className="title-underline" />
        <p>
          Hi, I’m a Full-Stack Web Developer who is addicted to learning and
          loves working with people. In general, I focus on{" "}
          <strong>Web Development</strong>, <strong>Design</strong>, and{" "}
          <strong>Developer Tools</strong>. Here's what you can expect from this
          newsletter.
        </p>
        <ul>
          <li>Latest Video and Blog Content</li>
          <li>Premium Courses</li>
          <li>Soft Skills and Career Development</li>
          <li>A bit of personal stuff :)</li>
        </ul>
        <NewsletterForm />
      </div>
    </Layout>
  );
}
