import React from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import Post from "../templates/post";
export default function post({ pageContext: post }) {
  return (
    <Layout>
      <SEO title={post.title} keywords={[``]} type="blog" />
      <div className="container">
        <Post post={post} />
      </div>
    </Layout>
  );
}
