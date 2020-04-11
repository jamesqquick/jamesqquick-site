import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Share from "../components/Share";
import "../sass/posts.scss";
import Blurb from "../components/Blurb";
import { graphql } from "gatsby";
import ReactMarkdown from "react-markdown";
import YouTube from "../components/YouTube";
function BlogPost(props) {
  console.log(props);

  const post = {
    ...props.data.sanityPost,
    slug: props.data.sanityPost.slug.current,
    tags: props.data.sanityPost.tags.map(tag => tag.title),
  };
  console.log(post);

  const blurbHeader = "Subscribe to the newsletter for updated content.";
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
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <div className="container">
        <article className="post">
          <header>
            <h1 className="post--title">{post.title}</h1>
            <p className="post--date">{post.publishedDate}</p>
          </header>
          <section>
            {post.youTubeVideoId && <YouTube id={post.youTubeVideoId} />}
            <ReactMarkdown source={post.body} linkTarget="_blank" />
          </section>
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
      body
      _id
      youTubeVideoId
      publishedDate(formatString: "MM/DD/YYYY")
      tags {
        title
      }
    }
  }
`;
