import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { graphql } from "gatsby";

export default function resources({ data }) {
  const resources = data.allSanityResource.nodes;
  const types = new Set();
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    types.add(resource.type[0].title);
  }
  const typesArr = [...types];
  return (
    <Layout>
      <SEO
        title="Resources"
        keywords={[
          `teaching`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <section className="section">
        <h1 className="h1 title">Resources</h1>
        <hr className="title-underline" />
        <p>
          I'm always sharing resources with people from one off questions. I
          figured it would be worth jotting them all down so that anyone can
          have a quick reference to tons of great content!
        </p>
        <p>
          <strong>Disclaimer</strong> - Some of the links below might be
          affiliate links. However, I have either personally watched/taken all
          of the content listed below or had close friends share very positive
          feedback.
        </p>
      </section>
      {typesArr.map((type, index) => (
        <section key={index}>
          <h3 className="h3">{type}</h3>
          <ul>
            {resources
              .filter(resource => resource.type[0].title === type)
              .map((resource, i) => (
                <p key={i}>
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.title}
                  </a>
                </p>
              ))}
          </ul>
        </section>
      ))}
    </Layout>
  );
}

export const query = graphql`
  query ResourcesQuery {
    allSanityResource {
      nodes {
        _id
        title
        tag {
          title
        }
        link
        type {
          title
        }
      }
    }
  }
`;
