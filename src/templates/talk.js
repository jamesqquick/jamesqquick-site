import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function talk(props) {
  const talk = props.pageContext;
  return (
    <Layout>
      <SEO title={talk.title} keywords={[``]} />
      <div className="container post">
        <h1 className="post-title">{talk.title}</h1>
        <p className="post-date">
          <a target="_blank" href={talk.link}>
            {talk.conference} - {talk.date} ({talk.linkText})
          </a>
        </p>

        <div dangerouslySetInnerHTML={{ __html: talk.html }} />
      </div>
    </Layout>
  );
}
