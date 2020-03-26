import React from "react";
import { Link } from "gatsby";
import "../sass/card.scss";

export default function Card({
  title,
  link,
  description,
  details,
  children,
  isLinkLocal = true,
}) {
  return (
    <div className="card">
      {isLinkLocal ? (
        <Link to={link}>
          <h2 className="card--title">{title}</h2>
        </Link>
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <h2 className="card--title">{title}</h2>
        </a>
      )}
      <p className="card--details">
        <small>{details}</small>
      </p>
      <p
        className="card--description"
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>
      {children}
    </div>
  );
}
