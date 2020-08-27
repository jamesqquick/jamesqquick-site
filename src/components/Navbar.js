import React from "react";
import "../sass/navbar.scss";
import { Link } from "gatsby";

export default function Navbar() {
  return (
    <nav className="nav">
      <h1 className="h1 nav-title text-center">
        <Link to="/" className="nav-brand">
          James <span className="accent">Q</span> Quick
        </Link>
      </h1>
      {/* <hr className="title-underline" /> */}
      <h2 className="h2 nav-subtitle text-center">
        Developer. Speaker. Teacher.
      </h2>
      <ul className="nav-items">
        <Link className="nav-item" to="/blog" activeClassName="active">
          Blog
        </Link>
        <Link className="nav-item" to="/streams" activeClassName="active">
          Streams
        </Link>

        <Link className="nav-item" to="/talks" activeClassName="active">
          Talks
        </Link>
        <Link className="nav-item" to="/courses" activeClassName="active">
          Courses
        </Link>
        <Link className="nav-item" to="/contact" activeClassName="active">
          Contact
        </Link>
        <Link className="nav-item" to="/newsletter" activeClassName="active">
          Newsletter
        </Link>
        {/* <Link className="nav-item" to="/uses">
          Uses
        </Link> */}
      </ul>
    </nav>
  );
}
