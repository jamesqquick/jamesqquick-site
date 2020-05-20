import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/posts.scss";
import { graphql } from "gatsby";
import Post from "../components/Post";

function Course({ data }) {
  const course = {
    ...data.sanityCourse,
    slug: data.sanityCourse.slug.current,
    tags: data.sanityCourse.tags.map(tag => tag.title),
  };
  const courseLink = course.courseLink;
  course.externalLink = courseLink;
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
      youTubeVideoId
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
