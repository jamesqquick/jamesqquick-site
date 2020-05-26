import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Link, graphql } from "gatsby";
import CardList from "../components/CardList";

export default function courses({ data }) {
  const courses = data.allSanityCourse.nodes.map(node => ({
    ...node,
    slug: node.slug.current,
    tags: node.tags.map(tag => tag.title),
  }));
  return (
    <Layout>
      <SEO
        title="Courses"
        keywords={[
          `courses`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <div className="container">
        <h1 className="title">Courses</h1>
        <hr className="title-underline" />

        <p>
          I've taught tens of thousands of students in person and online. I've
          got a passion for Web Development that I want to share with you!
        </p>

        <h2>Learn Fullstack Web Development</h2>
        <p>Here's a few topics I can help you get better at.</p>
        <ul>
          <li>Frontend Development</li>
          <li>Backend Development</li>
          <li>Web design</li>
          <li>Developer Tools</li>

          <li>People Skills</li>
          <li>Career Development</li>
        </ul>
        <CardList cards={courses} />
        <h2>Looking for Custom Content?</h2>
        <p>
          I often get requests to create custom content like individual courses,
          one-off videos, articles, etc. If you're interested in something,{" "}
          <Link to="/contact">contact me</Link> and include all of the necessary
          details.
        </p>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query {
    allSanityCourse(sort: { order: DESC, fields: [publishedDate] }) {
      nodes {
        title
        courseLink
        slug {
          current
        }
        _id
        excerpt
        publishedDate(formatString: "MM/DD/YYYY")
        tags {
          title
        }
        coverImage {
          asset {
            fluid(maxWidth: 700) {
              ...GatsbySanityImageFluid
            }
          }
        }
      }
    }
  }
`;
