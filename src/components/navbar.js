import React from "react";
import "../sass/navbar.scss";
import logo from "../images/logo-256.png";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Link, animateScroll as scroll } from "react-scroll";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false
    };
  }

  render = () => (
    <nav className={"nav" + (this.state.navOpen ? " open" : "")} id="navbar">
      <div className="nav-content">
        <div className="flex flex-between flex-align-center full-width">
          <div className="nav-brand">
            <a>
              {/* <img
                src={logo}
                alt="Learn Build Teach Logo."
                onClick={this.scrollToTop}
              /> */}
              James Q Quick
            </a>
          </div>
          <a id="hamburgerBtn">
            <FontAwesomeIcon
              icon={this.state.navOpen ? faTimes : faBars}
              size="2x"
              onClick={this.toggleNavbar}
            />
          </a>
        </div>
        <ul className={"nav-items" + (this.state.navOpen ? "" : " hidden-sm")}>
          <li className="nav-item">
            <Link
              activeClass="active"
              to="courses"
              spy={true}
              smooth={true}
              offset={-50}
              duration={500}
              onClick={this.closeNavbar}
            >
              Who
            </Link>
          </li>
          <li className="nav-item">
            <Link
              activeClass="active"
              to="courses"
              spy={true}
              smooth={true}
              offset={-50}
              duration={500}
              onClick={this.closeNavbar}
            >
              What
            </Link>
          </li>
          <li className="nav-item">
            <Link
              activeClass="active"
              to="courses"
              spy={true}
              smooth={true}
              offset={-50}
              duration={500}
              onClick={this.closeNavbar}
            >
              Testimonials
            </Link>
          </li>
          <li className="nav-item">
            <Link
              activeClass="active"
              to="courses"
              spy={true}
              smooth={true}
              offset={-50}
              duration={500}
              onClick={this.closeNavbar}
            >
              Contact
            </Link>
          </li>
          {/* <li className="nav-item">
            <a href="#contact">Contact</a>
          </li> */}
        </ul>
      </div>
    </nav>
  );

  scrollToTop = () => {
    scroll.scrollToTop();
  };

  scrollToBottom = () => {
    console.log("scroll to bottom");
    scroll.scrollToBottom();
  };
  closeNavbar = () => {
    this.setState({ navOpen: false });
  };

  toggleNavbar = () => {
    this.setState({
      navOpen: !this.state.navOpen
    });
  };
}

export default Navbar;
