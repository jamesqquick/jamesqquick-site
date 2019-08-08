import React from "react";
import { Link } from "gatsby";

export default function card(props) {
  return (
    <div>
      <Link to={props.slug}>
        <h1>{props.title}</h1>
      </Link>

      <p>{props.meta}</p>
    </div>
  );
}
