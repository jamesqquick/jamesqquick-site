import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Link, graphql } from "gatsby";
import CardList from "../components/CardList";
import prefixPath from "../utils/prefixPath";

export default function courses({ data }) {
  const courses = data.allSanityCourse.nodes.map(node => ({
    ...node,
    slug: prefixPath("courses", node.slug.current),
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
      <header className="header">
        <h1 className="h1 title">Courses</h1>
        <hr className="title-underline" />

        <p>
          I've taught tens of thousands of students in person and online. I've
          got a passion for Web Development that I want to share with you!
        </p>
      </header>

      <section className="section">
        <h2 className="h2">Learn Fullstack Web Development</h2>
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
        <h2 className="h2">Looking for Custom Content?</h2>
        <p>
          I often get requests to create custom content like individual courses,
          one-off videos, articles, etc. If you're interested in
          something,contact me and include all of the necessary details.
        </p>
        <div className="text-center mt-4">
          <Link to="/contact" target="_blank" className="btn">
            Contact Me!
          </Link>
        </div>
      </section>
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
