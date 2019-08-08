import React from "react";
import { Link } from "gatsby";
import "../sass/card.scss";

export default function card(props) {
  return (
    <div className="card">
      {props.slug ? (
        <Link to={props.slug}>
          <h1 className="card-title">{props.title}</h1>
        </Link>
      ) : (
        <h1>{props.title}</h1>
      )}
      {props.link && props.linkText && (
        <a className="card-link" href={props.link}>
          {props.linkText}
        </a>
      )}
      <p>
        {props.description.substring(0, 200)}...{" "}
        <span>
          <Link to={props.slug}>more</Link>
        </span>
      </p>
      <p>{props.meta}</p>
    </div>
  );
}
