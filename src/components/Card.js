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
    <li className="card">
      {coverImage && (
        <Img className="card--img" fluid={coverImage.asset.fluid} />
      )}
      <div className="card--content">
        {isLinkLocal ? (
          <Link to={link}>
            <h3 className="card--title">{title}</h3>
          </Link>
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <h3 className="card--title">{title}</h3>
          </a>
        )}
        <p className="card--date">
          <small>{details}</small>
        </p>
        {children}
      </div>
    </li>
  );
}
