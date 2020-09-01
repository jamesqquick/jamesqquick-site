import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import "../sass/posts.scss";
import { graphql } from "gatsby";
import Post from "../components/Post";

function BlogPost(props) {
  const post = {
    ...props.data.sanityPost,
    slug: props.data.sanityPost.slug.current,
    tags: props.data.sanityPost.tags.map(tag => tag.title),
  };

  let coverImageUrl = undefined;
  if (post.coverImage) {
    coverImageUrl = post.coverImage.asset.fluid.src;
  }

  return (
    <Layout>
      <SEO
        title={post.title}
        keywords={post.keywords}
        type="blog"
        description={post.excerpt}
        image={coverImageUrl}
      />
      <Post post={post} />
    </Layout>
  );
}

export default BlogPost;

export const pageQuery = graphql`
  query BlogPostBySlug($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    sanityPost(_id: { eq: $id }) {
      title
      slug {
        current
      }
      excerpt
      _id
      youTubeVideoId
      publishedDate(formatString: "MM/DD/YYYY")
      tags {
        title
      }
      keywords
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
