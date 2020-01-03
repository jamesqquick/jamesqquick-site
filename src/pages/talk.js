import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function talk(props) {
  return (
    <Layout>
      <SEO title={props.pageContext.title} keywords={[``]} />
      <div className="container post">
        <h1 className="post-title">{props.pageContext.title}</h1>
        <p className="post-date">
          {props.pageContext.conference} - {props.pageContext.date}
        </p>
        <a href={props.pageContext.slidesLink}>Slides</a>
        <p>{props.pageContext.description}</p>
      </div>
    </Layout>
  );
}
