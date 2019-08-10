import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";

export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);

  return (
    <Layout>
      <SEO title="Talks" keywords={[`conference talks`]} />
      <section className="section section-light">
        <div className="container talk">
          <h1 className="text-center section-title">TALKS</h1>
          <hr className="title-underline" />
          {talks.map(talk => (
            <div key={talk.id}>
              <Link to={talk.slug}>
                <h2 className="card-title">
                  {talk.name} - {talk.date}
                </h2>
              </Link>
              <a href={talk.slidesLink}>Get the slides!</a>

              <p>
                {talk.description.substring(0, 200)}...{" "}
                <span>
                  <Link to={talk.slug}>more</Link>
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const query = graphql`
  {
    allTalksJson {
      edges {
        node {
          name
          slug
          description
          imageUrl
          date
          id
          slidesLink
        }
      }
    }
  }
`;
