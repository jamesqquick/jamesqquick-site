import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

export default function snippets({ data }) {
  const content = data.allMarkdownRemark.edges[0].node.html;

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
        <div className="post">
          <h1 className="title">Snippets</h1>
          <hr className="title-underline" />
          <p>Here are some helpful snippets I use in Visual Studio Code</p>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query SnippetsQuery {
    allMarkdownRemark(filter: { frontmatter: { title: { eq: "Snippets" } } }) {
      edges {
        node {
          id
          html
        }
      }
    }
  }
`;
