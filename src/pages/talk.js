import React from "react";
import Layout from "../components/layout";
import Talk from "../templates/talk";
import SEO from "../components/seo";

export default function talk(props) {
  return (
    <Layout>
      <SEO title={props.pageContext.title} keywords={[`conference talks`]} />
      <div className="container">
        <Talk talk={props.pageContext} />
      </div>
    </Layout>
  );
}
