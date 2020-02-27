import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Share from "../components/Share";
import "../sass/posts.scss";
import Blurb from "../components/Blurb";
import { graphql } from "gatsby";
function BlogPost(props) {
  const post = props.data.markdownRemark;
  const blurbHeader = "Subscribe to the newsletter for updated content.";
  const coverImageUrl =
    props.data.site.siteMetadata.siteUrl +
    post.frontmatter.coverImage.childImageSharp.fluid.src;
  return (
    <Layout>
      test
      <SEO
        title={post.frontmatter.title}
        keywords={[``]}
        type="blog"
        description={post.excerpt}
        image={coverImageUrl}
      />
      <Share
        url={"www.jamesqquick.com/" + post.frontmatter.slug}
        title={post.frontmatter.title}
      />
      <div className="container">
        <article className="post">
          <header>
            <h1 className="post-title">{post.frontmatter.title}</h1>
            <p className="post-date">{post.frontmatter.publishDate}</p>
          </header>

          <section dangerouslySetInnerHTML={{ __html: post.html }} />
          <Blurb
            header={blurbHeader}
            buttonLink="/newsletter"
            buttonText="Newsletter"
            btnType="btn-secondary"
          />
        </article>
      </div>
    </Layout>
  );
}

export default BlogPost;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt(pruneLength: 160)
      frontmatter {
        title
        publishDate(formatString: "MM/DD/YYYY")
        tags
        slug
        type
        coverImage {
          childImageSharp {
            fluid(maxWidth: 800) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`;
