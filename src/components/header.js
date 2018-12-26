import PropTypes from "prop-types";
import React from "react";

const Header = ({ siteTitle }) => (
  <div>
    <p>{siteTitle}</p>
  </div>
);

Header.propTypes = {
  siteTitle: PropTypes.string
};

Header.defaultProps = {
  siteTitle: ``
};

export default Header;
