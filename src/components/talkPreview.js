import React from "react";
import { Link } from "gatsby";
import "../sass/Talk.scss";
export default function talkPreview({ talk }) {
  return (
    <div className="talk">
      <Link to={talk.slug}>
        <h2 className="card-title">{talk.title}</h2>
      </Link>
      <p>
        {talk.conference} - {talk.date}
      </p>
      <a href={talk.slidesLink}>Get the slides!</a>

      <p>
        {talk.description.substring(0, 200)}...{" "}
        <span>
          <Link to={talk.slug}>more</Link>
        </span>
      </p>
      <hr />
    </div>
  );
}
