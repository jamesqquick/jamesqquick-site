import React from "react";
import { Link } from "gatsby";
import "../sass/blurb.scss";
export default function Blurb({
  header,
  buttonText,
  buttonLink,
  isRelativeLink = true,
}) {
  console.log(buttonLink, isRelativeLink);
  return (
    <div id="contactBlurb" className="blurb">
      <h2 className="blurb-header">{header}</h2>
      {isRelativeLink ? (
        <Link to={`/${buttonLink}`} className="btn btn-secondary">
          {buttonText}
        </Link>
      ) : (
        <a href={buttonLink} className="btn btn-secondary">
          {buttonText}
        </a>
      )}
    </div>
  );
}
