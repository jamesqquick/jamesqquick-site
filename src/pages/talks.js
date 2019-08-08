import React from "react";
import { graphql } from "gatsby";
import Card from "../components/card";
import Layout from "../components/layout";
export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);
  talks.forEach(talk => {
    talk.description = talk.description.join(" ");
  });

  return (
    <Layout>
      <div className="container">
        {talks.map(talk => (
          <Card
            title={talk.name}
            slug={talk.slug}
            key={talk.id}
            meta={talk.date}
            description={talk.description}
            link={talk.slidesLink}
            linkText="Get the slides!"
          ></Card>
        ))}
      </div>
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
