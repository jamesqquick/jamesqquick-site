import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Share from "../components/Share";
import "../sass/posts.scss";
import Blurb from "../components/Blurb";
export default function BlogPost({ pageContext: post }) {
  const blurbHeader = "Subscribe to the newsletter for updated content.";
  return (
    <Layout>
      <SEO title={post.title} keywords={[``]} type="blog" />
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <div className="container">
        <div className="post">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">{post.publishDate}</p>

          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <Blurb
            header={blurbHeader}
            buttonLink="/newsletter"
            buttonText="Newsletter"
            btnType="btn-secondary"
          />
        </div>
      </div>
    </Layout>
  );
}
