import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import Blurb from "../components/Blurb";
import Img from "gatsby-image";
import { useStaticQuery } from "gatsby";
import YouTubeSubscribe from "../components/YouTubeSubscribe";

export default function teaching() {
  const contactBlurbHeader = "Interested in custom content or training?";
  const coursesBlurbHeader = "Looking for a full list of my courses?";

  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "teaching.jpg" }) {
        childImageSharp {
          # Specify the image processing specifications right in the query.
          # Makes it trivial to update as your page's design changes.
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `);
  return (
    <Layout>
      <SEO
        title="Teaching"
        keywords={[
          `teaching`,
          `web development`,
          `web design`,
          `developer tools`,
        ]}
      />
      <div className="container">
        <h1 className="title">Teaching</h1>
        <hr className="title-underline" />
        <Blurb
          header={coursesBlurbHeader}
          buttonLink="https://www.learnbuildteach.com"
          buttonText="Full Course List"
          isRelativeLink={false}
          btnType="btn-secondary"
        />
        <Img
          fluid={data.file.childImageSharp.fluid}
          alt="James Q Quick teaching"
        />

        <p>
          I've taught <strong>tens of thousands</strong> of students in person
          and online. I've got a passion for Web Development that I want to
          share with you!
        </p>
        <div className="text-center">
          <YouTubeSubscribe />
        </div>
        <p>I can help you learn...</p>
        <ul>
          <li>
            <strong>HTML</strong>, <strong>CSS</strong>, and{" "}
            <strong>JavaScript</strong>
          </li>
          <li>
            Backend Development with <strong>Nodejs</strong>
          </li>
          <li>
            Frontend Frameworks like <strong>React</strong> and{" "}
            <strong>Angular</strong>
          </li>
          <li>
            <strong>Soft Skills</strong> and <strong>Career Development</strong>
          </li>
        </ul>

        <ContactBlurb header={contactBlurbHeader} />
      </div>
    </Layout>
  );
}
