import React from "react";
import { Link } from "gatsby";
import "../sass/card.scss";
import Img from "gatsby-image";
export default function Card({
  title,
  link,
  description,
  details,
  children,
  isLinkLocal = true,
  coverImage,
}) {
  return (
    <Link to={link} className="card">
      {coverImage && (
        <Img className="card--img" fluid={coverImage.asset.fluid} />
      )}
      <div className="card--content">
        <h3 className="card--title">{title}</h3>
        <p className="card--date">
          <small>{details}</small>
        </p>
        {children}
      </div>
    </Link>
  );
}
