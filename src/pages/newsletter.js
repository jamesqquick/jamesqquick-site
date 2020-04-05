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
          Hi! I’m a fullstack Web Developer who is addicted to learning. I focus
          on <strong>Web Development</strong>, <strong>Design</strong>, and{" "}
          <strong>Developer Tools</strong>, and I love to share what I learn
          with other people. Here's what you can expect from this newsletter.
        </p>
        <ul>
          <li>Latest Video and Blog Content</li>
          <li>Upcoming Live streams</li>
          <li>Premium Web Development Courses</li>
          <li>Tips on People Skills/Career Development</li>
        </ul>
        <NewsletterForm />
      </div>
    </Layout>
  );
}
