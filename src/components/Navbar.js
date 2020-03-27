import React, { useState } from "react";
import "../sass/navbar.scss";
import {
  faBars,
  faTimes,
  faMicrophone,
  faPen,
  faStream,
  faEnvelope,
  faApple,
  faAppleAlt,
  faBell,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
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
      <button id="hamburgerBtn">
        <FontAwesomeIcon
          icon={navOpen ? faTimes : faBars}
          size="1x"
          onClick={() => setNavOpen(!navOpen)}
        />
      </button>
      <nav className={"nav" + (navOpen ? " open" : "")} id="navbar">
        <ul className={"nav-items" + (navOpen ? "" : " hidden-sm")}>
          <Link to="/" activeClassName="active">
            <FontAwesomeIcon icon={faHome} size="1x" />
            Home
          </Link>
          <Link to="/blog" activeClassName="active">
            <FontAwesomeIcon icon={faPen} size="1x" />
            Blog
          </Link>
          <Link to="/live" activeClassName="active">
            <FontAwesomeIcon icon={faStream} size="1x" />
            Live
          </Link>
          <Link to="/teaching" activeClassName="active">
            <FontAwesomeIcon icon={faAppleAlt} size="1x" />
            Teaching
          </Link>
          <Link to="/speaking" activeClassName="active">
            <FontAwesomeIcon icon={faMicrophone} size="1x" />
            Speaking
          </Link>
          <Link to="/contact" activeClassName="active">
            <FontAwesomeIcon icon={faEnvelope} size="1x" />
            Contact
          </Link>
          <Link to="/newsletter" activeClassName="active">
            <FontAwesomeIcon icon={faBell} size="1x" />
            Newsletter
          </Link>
        </ul>
      </nav>
    </>
  );
}
