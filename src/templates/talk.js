import React from "react";
import Layout from "../components/layout";

export default function talk(props) {
  const { name, description, imageUrl, date, slidesLink } = props.pageContext;
  return (
    <Layout>
      <div className="container">
        <h1>{name}</h1>
        <a href={slidesLink}>Slides</a>
        <p>{description}</p>
      </div>
    </Layout>
  );
}
