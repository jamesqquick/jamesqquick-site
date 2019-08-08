import React from "react";
import { graphql } from "gatsby";
import Card from "../components/card";
import Layout from "../components/layout";
export default function talks({ data }) {
  const talks = data.allTalksJson.edges.map(item => item.node);

  return (
    <Layout>
      {talks.map(talk => (
        <Card
          title={talk.name}
          slug={talk.slug}
          key={talk.id}
          meta={talk.date}
        ></Card>
      ))}
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
