import React from "react";
import PropTypes from "prop-types";
import "../sass/index.scss";
import Navbar from "./Navbar";

import "../sass/layout.scss";
import { useStaticQuery, graphql } from "gatsby";
// import PromotionalBanner from "./PromotionalBanner";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <div className="layout">
      {/* <PromotionalBanner /> */}
      <div className="container">
        <Navbar siteTitle={data.site.siteMetadata.title} />
        {children}
        <Footer />
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
