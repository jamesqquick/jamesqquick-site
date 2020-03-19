import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import ContactBlurb from "../components/ContactBlurb";
import Blurb from "../components/Blurb";
import Img from "gatsby-image";
import { useStaticQuery, graphql, Link } from "gatsby";
import YouTubeSubscribe from "../components/YouTubeSubscribe";
import GatsbyImage from "gatsby-image";

export default function teaching() {
  const contactBlurbHeader = "Interested in custom content or training?";
  const coursesBlurbHeader = "Looking for a full list of my courses?";

  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "images/teaching.jpg" }) {
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
        {/* <Blurb
          header={coursesBlurbHeader}
          buttonLink="https://www.learnbuildteach.com"
          buttonText="Full Course List"
          isRelativeLink={false}
          btnType="btn-secondary"
        /> */}
        {/* <Img
          fluid={data.file.childImageSharp.fluid}
          alt="James Q Quick teaching"
        /> */}
        <p>
          I've taught tens of thousands of students in person and online. I've
          got a passion for Web Development that I want to share with you!
        </p>
        <p>
          After getting my first taste of JavaScript and Web Development in
          2016, I feel in love with the ecosystem and community. I love Web
          Development because it empowers me to build amazing applications that
          people across the world have access to.
        </p>
        <h3>Learn Fullstack Web Development</h3>
        <p>Here's a few topics I can help you get better at.</p>
        <ul>
          <li>Frontend Development</li>
          <li>Backend Development</li>
          <li>Web design</li>
          <li>Developer Tools</li>

          <li>People Skills</li>
          <li>Career Development</li>
        </ul>
        <h3>Where to find my content...</h3>
        <p>
          I create content in different formats across different mediums. I am
          constantly creating new content so be sure to sign up for my{" "}
          <Link to="/contact">newsletter</Link> for updates!
        </p>
        <ul>
          <li>
            Free content on{" "}
            <a href="https://www.youtube.com/jamesqquick" target="_blank">
              YouTube
            </a>
          </li>
          <li>
            Weekly live streams on{" "}
            <a href="https://www.twitch.tv/jamesqquick" target="_blank">
              Twitch
            </a>
          </li>
          <li>
            Full list of courses at{" "}
            <a href="https://www.learnbuildteach.com" target="_blank">
              Learn Build Teach
            </a>
          </li>
          <li>
            Articles on{" "}
            <a href="https://scotch.io/@jamesqquick" target="_blank">
              Scotch.io
            </a>
          </li>
        </ul>
        {/* <div className="text-center">
          <YouTubeSubscribe />
        </div> */}
        <h3>Looking for Custom Content?</h3>
        <p>
          I often get requests to create custom content like individual courses,
          one-off videos, articles, etc. If you're interested in something,{" "}
          <Link to="/contact">contact me</Link> and include all of the necessary
          details
        </p>
        {/* <ContactBlurb header={contactBlurbHeader} /> */}
      </div>
    </Layout>
  );
}
