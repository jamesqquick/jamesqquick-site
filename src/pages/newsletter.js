import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
// import MailchimpNewlsetter from "../components/MailchimpNewlsetter";
import PodiaNewsletter from "../components/PodiaNewsletter";
// const queryString = require("query-string");

export default function newsletter() {
  // const queryParams = queryString.parse(location.search);
  // const giveaway = queryParams.giveaway || "DEFAULT";

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
          Subscribe to learn more about <strong>Web Development</strong>,{" "}
          <strong>Design</strong>, and <strong>Developer Tools</strong>. I love
          to share, so here's what you can expect from this newsletter.
        </p>
        <ul>
          <li>Latest Videos and Articles</li>
          <li>Live Streams and Webinars</li>
          <li>Course Announcements and Discounts</li>
          <li>Career Development Tips</li>
        </ul>
        {/* <MailchimpNewlsetter giveaway={giveaway} /> */}
        <PodiaNewsletter newsletterId={"65004"} />
      </header>
    </Layout>
  );
}
