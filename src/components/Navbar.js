import React from "react";
import "../sass/navbar.scss";
import { Link } from "gatsby";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        James <strong className="accent">Q</strong> Quick
      </Link>

      <ul className="nav-items">
        <Link className="nav-item" to="/courses">
          Courses
        </Link>
        <Link className="nav-item" to="/blog">
          Blog
        </Link>
        <Link className="nav-item" to="/streaming">
          Streaming
        </Link>

        <Link className="nav-item" to="/speaking">
          Speaking
        </Link>
        <Link className="nav-item" to="/contact">
          Contact
        </Link>
        <Link className="nav-item" to="/newsletter">
          Newsletter
        </Link>
        <Link className="nav-item" to="/uses">
          Uses
        </Link>
      </ul>
    </nav>
  );
}
