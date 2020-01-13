import React from "react";
import { Link } from "gatsby";

export default function postPreview({ post, tagSelected }) {
  const tags = post.tags.replace(" ", "").split(",");
  return (
    <div className="post">
      <Link to={post.slug}>
        <h2 className="post-title">{post.title}</h2>
      </Link>
      <p className="post-date">
        <small>{post.publishDate}</small>
      </p>

      <p>{post.excerpt}</p>
      <p>
        {tags.map((tag, i) => (
          <small key={i} className="tag" onClick={() => tagSelected(tag)}>
            {tag}
          </small>
        ))}
      </p>
      <hr />
    </div>
  );
}
