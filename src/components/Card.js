import React from "react";
import { Link } from "gatsby";
import "../sass/card.scss";
const ReactMarkdown = require("react-markdown");

export default function Card({
  title,
  link,
  description,
  details,
  children,
  isLinkLocal = true,
}) {
  return (
    <li className="card">
      {isLinkLocal ? (
        <Link to={link}>
          <h3 className="card--title">{title}</h3>
        </Link>
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <h3 className="card--title">{title}</h3>
        </a>
      )}
      <small className="card--date">{details}</small>
      <ReactMarkdown source={description} />
      {children}
    </li>
  );
}
