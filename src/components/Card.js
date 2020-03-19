import React from "react";
import { Link } from "gatsby";
import "../sass/card.scss";

export default function Card({ title, link, description, details, children }) {
  return (
    <div className="card">
      <Link to={link}>
        <h2 className="card--title">{title}</h2>
      </Link>
      <p className="card--details">
        <small>{details}</small>
      </p>
      <p className="card--description">{description}</p>
      {children}
    </div>
  );
}
