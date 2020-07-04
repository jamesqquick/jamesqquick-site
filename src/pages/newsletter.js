import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import MailchimpNewlsetter from "../components/MailchimpNewlsetter";
import PodiaNewsletter from "../components/PodiaNewsletter";
const queryString = require("query-string");

export default function newsletter({ location }) {
  const queryParams = queryString.parse(location.search);
  const giveaway = queryParams.giveaway || "DEFAULT";

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
      <header className="header">
        <h1 className="h1 title">Newsletter</h1>
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
        {/* <MailchimpNewlsetter giveaway={giveaway} /> */}
        <PodiaNewsletter newsletterId={"65004"} />
      </header>
    </Layout>
  );
}
