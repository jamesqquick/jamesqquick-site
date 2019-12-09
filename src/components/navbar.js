import React from "react";
import "../sass/navbar.scss";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "gatsby";
import headshot from "../images/headshot-512.png";
import SocialFollow from "./SocialFollow";
import NavNewsletter from "./navNewsletter";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false,
    };
  }

  render = () => (
    <>
      <a id="hamburgerBtn">
        <FontAwesomeIcon
          icon={this.state.navOpen ? faTimes : faBars}
          size="2x"
          onClick={this.toggleNavbar}
        />
      </a>
      <nav className={"nav" + (this.state.navOpen ? " open" : "")} id="navbar">
        <div className="nav-brand">
          <img
            src={headshot}
            alt="James Q Quick headshot."
            onClick={this.scrollToTop}
          />
          <Link to="/">James Q Quick</Link>
        </div>

        <ul className={"nav-items" + (this.state.navOpen ? "" : " hidden-sm")}>
          <Link to="/about">About</Link>
          <Link to="/videos">Videos</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/speaking">Speaking</Link>
        </ul>
        <div className="footer">
          <NavNewsletter />
          <hr />
          <SocialFollow color="light" size={this.state.navOpen ? "md" : "sm"} />
        </div>
      </nav>
    </>
  );

  toggleNavbar = () => {
    this.setState({
      navOpen: !this.state.navOpen,
    });
  };
}

export default Navbar;
