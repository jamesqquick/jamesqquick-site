import React from "react";
import { Link } from "gatsby";
import "../sass/Talk.scss";
export default function talkPreview({ talk }) {
  return (
    <div className="post-preview">
      <Link to={talk.slug}>
        <h2 className="post-title">{talk.title}</h2>
      </Link>
      <p className="post-date">
        {talk.conference} - {talk.date} | <a href={talk.slidesLink}>SLIDES</a>
      </p>

      <p>{talk.excerpt}</p>
      <hr />
    </div>
  );
}
