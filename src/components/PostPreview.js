import React from "react";
import { Link } from "gatsby";

export default function postPreview({ post }) {
  return (
    <div className="post-preview">
      <Link to={post.slug}>
        <h2 className="post-title">{post.title}</h2>
      </Link>
      <p className="post-date">
        <small>{post.publishDate}</small>
      </p>

      <p>{post.excerpt}</p>
      <hr />
    </div>
  );
}
