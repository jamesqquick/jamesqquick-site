import React from "react";
import "../sass/footer.scss";
import SocialFollow from "./SocialFollow";

export default function footer() {
  return (
    <footer className="footer container">
      <SocialFollow size="md" />
      <p className="text-center">
        Built with <strong>Gatsby</strong>. Data from <strong>Sanity.io</strong>
        . Hosted on <strong>Netlify</strong>.
      </p>
    </footer>
  );
}
