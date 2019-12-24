import React from "react";
import { Link } from "gatsby";
import "../sass/blurb.scss";
export default function ContactBlurb({ header }) {
  return (
    <div id="contactBlurb" className="blurb">
      <h2 className="blurb-header">{header}</h2>
      <Link to="/contact" className="btn btn-secondary">
        Contact Me
      </Link>
    </div>
  );
}
