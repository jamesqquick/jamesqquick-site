import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function snippets() {
  return (
    <Layout>
      <SEO
        title="Resources"
        keywords={[
          `snippets`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <div className="container">
        <h1 className="title">Snippets</h1>
        <hr className="title-underline" />
        <p>Here are the snippets I use in Visual Studio Code</p>
        <h2>JavaScript</h2>
      </div>
    </Layout>
  );
}
