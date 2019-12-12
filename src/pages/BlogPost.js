import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Share from "../components/Share";
import NewsletterForm from "../components/NewsletterForm";
import "../sass/posts.scss";
export default function BlogPost({ pageContext: post }) {
  return (
    <Layout>
      <SEO title={post.title} keywords={[``]} type="blog" />
      <Share url={"www.jamesqquick.com/" + post.slug} title={post.title} />
      <div className="container">
        <div className="post">
          <h1>{post.title}</h1>
          <p>{post.publishDate}</p>
          <hr className="title-underline" />
          <h3 className="section-subtitle">
            Sign up for articles, videos, courses, and more!
          </h3>
          <NewsletterForm />
          <hr></hr>

          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </div>
    </Layout>
  );
}
