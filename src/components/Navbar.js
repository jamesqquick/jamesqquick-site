import React, { useState } from "react";
import "../sass/navbar.scss";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useStaticQuery, graphql } from "gatsby";
import SocialFollow from "./SocialFollow";
import Img from "gatsby-image";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);

  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "images/headshot.png" }) {
        childImageSharp {
          # Specify the image processing specifications right in the query.
          # Makes it trivial to update as your page's design changes.
          fixed(width: 120, height: 120) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `);
  return (
    <>
      <button className="hamburgerBtn">
        <FontAwesomeIcon
          icon={faBars}
          size="2x"
          onClick={() => setNavOpen(!navOpen)}
        />
      </button>
      {navOpen && (
        <button id="closeBtn" className="closeBtn">
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            onClick={() => setNavOpen(!navOpen)}
          />
        </button>
      )}
      <nav className={"nav" + (navOpen ? " open" : "")} id="navbar">
        <div className="nav-brand">
          <Img
            fixed={data.file.childImageSharp.fixed}
            alt="James Q Quick headshot"
            className="nav-brand-img"
          />
          <Link to="/" className="nav-brand-link">
            James <strong>Q</strong> Quick
          </Link>
        </div>

        <ul className={"nav-items" + (navOpen ? "" : " hidden-sm")}>
          {/* <Link to="/about">About</Link> */}
          <Link to="/blog">Blog</Link>
          <Link to="/streaming">Streaming</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/speaking">Speaking</Link>
          <Link to="/contact">Contact</Link>
        </ul>
        <div className="footer">
          {/* <NavNewsletter /> */}
          <Link to="/newsletter">
            <button className="btn btn-secondary">Newsletter</button>
          </Link>
          <hr />
          <SocialFollow color="light" size={navOpen ? "md" : "sm"} />
        </div>
      </nav>
    </>
  );
}
