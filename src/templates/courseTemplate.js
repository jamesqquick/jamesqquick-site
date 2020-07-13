import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/posts.scss";
import { graphql } from "gatsby";
import Course from "../components/Course";
function CourseTemplate({ data }) {
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

      <Course course={course} headshot={data.file.childImageSharp.fixed} />
    </Layout>
  );
}

export default CourseTemplate;

export const pageQuery = graphql`
  query CourseBySlug($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    file(relativePath: { eq: "images/headshot.png" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fixed(width: 256, height: 256) {
          ...GatsbyImageSharpFixed
        }
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
      whatYouGet: _rawWhatYouGet(resolveReferences: { maxDepth: 10 })
      faq: _rawFaq(resolveReferences: { maxDepth: 10 })
      courseOverview: _rawCourseOverview(resolveReferences: { maxDepth: 10 })
      whoIsItFor: _rawWhoIsItFor(resolveReferences: { maxDepth: 10 })
      courseOutline: _rawCourseOutline(resolveReferences: { maxDepth: 10 })
      fullCost
      discountCost
      newsletterSignupURL
      newsletterMessage
      youTubeVideoId
      published
      purchaseLink
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
