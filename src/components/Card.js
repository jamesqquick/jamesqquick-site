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
  imageOnly = false,
}) {
  if (imageOnly) {
    return (
      <Link to={link} className="img-card">
        <Img className="card--img" fluid={coverImage.asset.fluid} />
      </Link>
    );
  }

  const shortDescription = description
    ? description.substring(0, 100) + "..."
    : "";
  return (
    <Link to={link} className="card">
      {coverImage && (
        <Img className="card--img" fluid={coverImage.asset.fluid} />
      )}
      <div className="card--content">
        <h3 className="h3 card--title">{title}</h3>
        <p className="card--description">{shortDescription}</p>
        <p className="card--date">
          <small>{details}</small>
        </p>
        {children}
      </div>
    </Link>
  );
}
