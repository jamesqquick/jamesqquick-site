import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/posts.scss";
import { graphql } from "gatsby";
import Post from "../components/Post";
import PodiaNewsletter from "../components/PodiaNewsletter";

function Course(props) {
  const course = {
    ...props.data.sanityCourse,
    slug: props.data.sanityCourse.slug.current,
    tags: props.data.sanityCourse.tags.map(tag => tag.title),
  };
  delete course.courseLink;
  const coverImageUrl = course.coverImage.asset.fluid.src;
  return (
    <Layout>
      <SEO
        title={course.title}
        keywords={[`{course.title}`]}
        type="blog"
        description={course.excerpt}
        image={coverImageUrl}
      />
      {course.newsletterSignupURL && course.newsletterMessage && (
        <>
          <h3>{course.newsletterMessage}</h3>
          <PodiaNewsletter url={course.newsletterSignupURL} />
        </>
      )}
      <Post post={course} />
    </Layout>
  );
}

export default Course;

export const pageQuery = graphql`
  query CourseBySlug($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    sanityCourse(_id: { eq: $id }) {
      title
      slug {
        current
      }
      excerpt
      _id
      courseLink
      publishedDate(formatString: "MM/DD/YYYY")
      tags {
        title
      }
      mainContent: _rawMainContent(resolveReferences: { maxDepth: 10 })
      newsletterSignupURL
      newsletterMessage
      coverImage {
        asset {
          fluid(maxWidth: 700) {
            ...GatsbySanityImageFluid
          }
        }
      }
    }
  }
`;
