import React from "react";
import { Link } from "gatsby";

export default function postPreview({ post }) {
  console.log(post);
  return (
    <div className="talk">
      <Link to={post.slug}>
        <h2 className="card-title">{post.title}</h2>
      </Link>
      <p>{post.publishDate}</p>

      <p>{post.excerpt}</p>
      <hr />
    </div>
  );
}
