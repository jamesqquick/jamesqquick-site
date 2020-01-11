import React, { useState } from "react";
import "../sass/navbar.scss";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useStaticQuery } from "gatsby";
import SocialFollow from "./SocialFollow";
import Img from "gatsby-image";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);

  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "images/headshot-512.png" }) {
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
      <button id="hamburgerBtn">
        <FontAwesomeIcon
          icon={navOpen ? faTimes : faBars}
          size="2x"
          onClick={() => setNavOpen(!navOpen)}
        />
      </button>
      <nav className={"nav" + (navOpen ? " open" : "")} id="navbar">
        <div className="nav-brand">
          <Img
            fixed={data.file.childImageSharp.fixed}
            alt="James Q Quick headshot"
          />
          <Link to="/">
            James <strong>Q</strong> Quick
          </Link>
        </div>

        <ul className={"nav-items" + (navOpen ? "" : " hidden-sm")}>
          {/* <Link to="/about">About</Link> */}
          <Link to="/teaching">Teaching</Link>
          <Link to="/speaking">Speaking</Link>
          <Link to="/blog">Blog</Link>
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
