import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/posts.scss";
import { graphql } from "gatsby";
import Post from "../components/Post";

function Course(props) {
  console.log(props);
  const post = {
    ...props.data.sanityCourse,
    slug: props.data.sanityCourse.slug.current,
    tags: props.data.sanityCourse.tags.map(tag => tag.title),
  };
  delete post.courseLink;

  const coverImageUrl = "";
  // props.data.site.siteMetadata.siteUrl +
  // post.coverImage.childImageSharp.fluid.src;
  return (
    <Layout>
      test
      <SEO
        title={post.title}
        keywords={[``]}
        type="blog"
        description={post.excerpt}
        image={coverImageUrl}
      />
      <Post post={post} />
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
