import React from "react";
import Layout from "../components/layout";

export default function talk({ post }) {
  const { id, title, slug, html, publishDate, coverImage, tags } = post;
  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
