import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Link, graphQL } from "gatsby";
import CardList from "../components/CardList";

export default function teaching({ data }) {
  console.log(data);
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
        <p>
          After getting my first taste of JavaScript and Web Development in
          2016, I feel in love with the ecosystem and community. I love Web
          Development because it empowers me to build amazing applications that
          people across the world have access to.
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

        {/* <h2>Where to Find My Content</h2>
        <p>
          I create content in different formats across different mediums. I am
          constantly creating new content so be sure to sign up for my{" "}
          <Link to="/contact">newsletter</Link> for updates!
        </p>
        <ul>
          <li>
            Free content on{" "}
            <a
              href="https://www.youtube.com/jamesqquick"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          </li>
          <li>
            Weekly live streams on{" "}
            <a
              href="https://www.twitch.tv/jamesqquick"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitch
            </a>
          </li>
          <li>
            Full list of courses at{" "}
            <a
              href="https://www.learnbuildteach.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Build Teach
            </a>
          </li>
          <li>
            Articles on{" "}
            <a
              href="https://scotch.io/@jamesqquick"
              target="_blank"
              rel="noopener noreferrer"
            >
              Scotch.io
            </a>
          </li>
        </ul> */}
        {/* <div className="text-center">
          <YouTubeSubscribe />
        </div> */}
        <h2>Looking for Custom Content?</h2>
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
