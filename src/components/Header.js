import PropTypes from "prop-types";
import React from "react";
import Img from "gatsby-image";
import "../sass/header.scss";
import SocialFollow from "./SocialFollow";
const Header = ({ fixed }) => (
  <div className="section hero">
    <div>
      <p className="h2">Hi, I'm James!</p>
      <p>
        I'm a Fullstack Web Developer who is addicted to learning and loves
        working with people. I live by the motto{" "}
        <strong>Learn Build Teach</strong>, so I’m excited to share the things I
        learn with you!
      </p>
      <SocialFollow size="lg" includeHandle={false} />
    </div>
    <div className="headshot">
      <Img fixed={fixed} />
    </div>
  </div>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
