import React from "react";
import "../sass/posts.scss";
export default function talk({ post }) {
  const { id, title, slug, html, publishDate, coverImage, tags } = post;
  return (
    <div className="post">
      <h1>{title}</h1>
      <hr className="title-underline" />

      <p>{publishDate}</p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
